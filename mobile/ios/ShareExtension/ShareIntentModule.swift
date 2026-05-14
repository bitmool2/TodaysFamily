import Foundation

/**
 * ShareIntentModule (iOS)
 *
 * React Native NativeModule that reads the payload written by the
 * ShareViewController into the shared App Group UserDefaults, then
 * converts the file paths to file:// URIs that React Native's <Image>
 * and FileSystem APIs can consume.
 *
 * Exposed methods (called from JS):
 *   getShareIntent()   → Promise resolves with SharePayload | null
 *   clearShareIntent() → void
 */
@objc(ShareIntentModule)
class ShareIntentModule: NSObject {

  private let appGroupID      = "group.com.todaysfamily.app"
  private let userDefaultsKey = "pendingShareIntent"

  // MARK: - getShareIntent

  @objc func getShareIntent(_ resolve: @escaping RCTPromiseResolveBlock,
                             reject: @escaping RCTPromiseRejectBlock) {
    guard let defaults = UserDefaults(suiteName: appGroupID),
          let raw = defaults.dictionary(forKey: userDefaultsKey) else {
      resolve(nil); return
    }

    var result: [String: Any] = [:]
    result["type"] = raw["type"] as? String ?? "image"
    result["text"] = raw["text"] as? String

    // Convert absolute paths to file:// URIs readable by React Native
    let rawPaths = raw["uris"] as? [String] ?? []
    result["uris"] = rawPaths.map { path -> String in
      path.hasPrefix("file://") ? path : "file://\(path)"
    }

    resolve(result)
  }

  // MARK: - clearShareIntent

  @objc func clearShareIntent() {
    UserDefaults(suiteName: appGroupID)?.removeObject(forKey: userDefaultsKey)
  }

  // MARK: - Required

  @objc static func requiresMainQueueSetup() -> Bool { false }
}
