/**
 * Expo config plugin — Android Share Intent
 *
 * Adds an <intent-filter> to MainActivity so the app appears in the
 * system share sheet when sharing image/* or text/plain from any app
 * (e.g. KidsNote, Gallery, Chrome).
 *
 * Also patches MainActivity.kt to forward new intents to React Native
 * via the ShareIntentModule.
 *
 * Run:  npx expo prebuild --clean
 */
import {
  ConfigPlugin,
  withAndroidManifest,
  withMainActivity,
  AndroidConfig,
} from '@expo/config-plugins';

const { getMainActivityOrThrow, addMetaDataItemToMainApplication } =
  AndroidConfig.Manifest;

// ─── Step 1 : AndroidManifest intent-filter ──────────────────────────────────

const withShareIntentFilter: ConfigPlugin = (config) =>
  withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    const activity = getMainActivityOrThrow(manifest);

    // Avoid duplicate filters on repeated prebuild runs
    const alreadyPatched = (activity['intent-filter'] ?? []).some(
      (f: any) =>
        f?.action?.some((a: any) => a.$?.['android:name'] === 'android.intent.action.SEND') &&
        f?.['data']?.some((d: any) => d.$?.['android:mimeType'] === 'image/*'),
    );

    if (!alreadyPatched) {
      const filter: any = {
        action: [{ $: { 'android:name': 'android.intent.action.SEND' } }],
        category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        data: [{ $: { 'android:mimeType': 'image/*' } }],
      };
      const filterText: any = {
        action: [{ $: { 'android:name': 'android.intent.action.SEND' } }],
        category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        data: [{ $: { 'android:mimeType': 'text/plain' } }],
      };
      const filterMultiple: any = {
        action: [{ $: { 'android:name': 'android.intent.action.SEND_MULTIPLE' } }],
        category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        data: [{ $: { 'android:mimeType': 'image/*' } }],
      };

      activity['intent-filter'] = [
        ...(activity['intent-filter'] ?? []),
        filter,
        filterText,
        filterMultiple,
      ];
    }

    return cfg;
  });

// ─── Step 2 : MainActivity.kt — forward intents to RN ────────────────────────

const IMPORT_BLOCK = `
import android.content.Intent
import com.todaysfamily.ShareIntentModule
`;

const ON_NEW_INTENT = `
  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
    ShareIntentModule.onNewIntent(intent)
  }
`;

const withMainActivityPatch: ConfigPlugin = (config) =>
  withMainActivity(config, (cfg) => {
    let contents = cfg.modResults.contents as string;

    // Add import once
    if (!contents.includes('com.todaysfamily.ShareIntentModule')) {
      contents = contents.replace(
        /^(package .+\n)/m,
        `$1${IMPORT_BLOCK}`,
      );
    }

    // Add onNewIntent override once, inside the class body before the last closing brace
    if (!contents.includes('onNewIntent')) {
      contents = contents.replace(
        /(class MainActivity.*?\{)([\s\S]*?)(\n\})/,
        (_, open, body, close) => `${open}${body}${ON_NEW_INTENT}${close}`,
      );
    }

    cfg.modResults.contents = contents;
    return cfg;
  });

// ─── Compose ─────────────────────────────────────────────────────────────────

const withAndroidShareIntent: ConfigPlugin = (config) => {
  config = withShareIntentFilter(config);
  config = withMainActivityPatch(config);
  return config;
};

export default withAndroidShareIntent;
