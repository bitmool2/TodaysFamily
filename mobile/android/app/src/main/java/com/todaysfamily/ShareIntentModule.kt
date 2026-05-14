package com.todaysfamily

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * React Native native module — Android Share Intent receiver
 *
 * Exposes two JS methods:
 *   getShareIntent()  → Promise<SharePayload | null>
 *   clearShareIntent() → void
 *
 * Also emits "ShareIntentReceived" event when the app is already running
 * and a new intent arrives via onNewIntent().
 */
class ShareIntentModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private var pendingIntent: Intent? = null

        /** Called from MainActivity.onNewIntent */
        fun onNewIntent(intent: Intent?) {
            pendingIntent = intent
        }
    }

    override fun getName() = "ShareIntentModule"

    // ── getShareIntent ────────────────────────────────────────────────────────

    @ReactMethod
    fun getShareIntent(promise: Promise) {
        val intent = pendingIntent ?: currentActivity?.intent
        if (intent == null) { promise.resolve(null); return }

        val action = intent.action
        if (action != Intent.ACTION_SEND && action != Intent.ACTION_SEND_MULTIPLE) {
            promise.resolve(null); return
        }

        val map = WritableNativeMap()

        when {
            // ── Single image ──────────────────────────────────────────────────
            Intent.ACTION_SEND == action && intent.type?.startsWith("image/") == true -> {
                val uri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                if (uri != null) {
                    map.putString("type", "image")
                    val array = WritableNativeArray()
                    array.pushString(resolveUri(uri))
                    map.putArray("uris", array)
                    map.putString("text", null)
                    promise.resolve(map)
                    return
                }
            }

            // ── Multiple images ───────────────────────────────────────────────
            Intent.ACTION_SEND_MULTIPLE == action && intent.type?.startsWith("image/") == true -> {
                val uris = intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
                if (!uris.isNullOrEmpty()) {
                    map.putString("type", "image")
                    val array = WritableNativeArray()
                    uris.forEach { array.pushString(resolveUri(it)) }
                    map.putArray("uris", array)
                    map.putString("text", null)
                    promise.resolve(map)
                    return
                }
            }

            // ── Text / URL ────────────────────────────────────────────────────
            Intent.ACTION_SEND == action && intent.type == "text/plain" -> {
                val text = intent.getStringExtra(Intent.EXTRA_TEXT)
                if (text != null) {
                    map.putString("type", "text")
                    map.putArray("uris", WritableNativeArray())
                    map.putString("text", text)
                    promise.resolve(map)
                    return
                }
            }
        }

        promise.resolve(null)
    }

    // ── clearShareIntent ──────────────────────────────────────────────────────

    @ReactMethod
    fun clearShareIntent() {
        pendingIntent = null
        currentActivity?.intent?.action = null
    }

    // ── Required for RN event emitter ─────────────────────────────────────────

    @ReactMethod
    fun addListener(eventName: String) { /* no-op */ }

    @ReactMethod
    fun removeListeners(count: Int) { /* no-op */ }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun resolveUri(uri: Uri): String {
        // content:// URIs need to be copied to a cache file for RN Image to read
        return if (uri.scheme == "content") {
            try {
                val inputStream = reactContext.contentResolver.openInputStream(uri)
                    ?: return uri.toString()
                val ext = reactContext.contentResolver.getType(uri)
                    ?.substringAfterLast('/') ?: "jpg"
                val file = java.io.File(reactContext.cacheDir, "share_${System.currentTimeMillis()}.$ext")
                file.outputStream().use { out -> inputStream.copyTo(out) }
                file.absolutePath
            } catch (e: Exception) {
                uri.toString()
            }
        } else {
            uri.toString()
        }
    }
}
