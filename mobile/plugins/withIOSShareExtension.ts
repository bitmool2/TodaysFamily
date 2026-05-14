/**
 * Expo config plugin — iOS Share Extension
 *
 * What it does during `npx expo prebuild`:
 *  1. Adds a new Xcode target "ShareExtension" pointing at ios/ShareExtension/
 *  2. Adds the App Group entitlement to both the main app and the extension
 *  3. Registers the todaysfamily:// URL scheme for deep linking back from the extension
 *
 * Run:  npx expo prebuild --clean  (required after first add)
 */
import {
  ConfigPlugin,
  withXcodeProject,
  withEntitlementsPlist,
  withInfoPlist,
  IOSConfig,
} from '@expo/config-plugins';
import * as path from 'path';
import * as fs from 'fs';

const APP_GROUP = 'group.com.todaysfamily.app';
const EXTENSION_NAME = 'ShareExtension';
const BUNDLE_ID_SUFFIX = '.ShareExtension';

// ─── Step 1 : Add App Group entitlement to main app ──────────────────────────

const withAppGroupEntitlement: ConfigPlugin = (config) =>
  withEntitlementsPlist(config, (cfg) => {
    const groups: string[] =
      cfg.modResults['com.apple.security.application-groups'] ?? [];
    if (!groups.includes(APP_GROUP)) groups.push(APP_GROUP);
    cfg.modResults['com.apple.security.application-groups'] = groups;
    return cfg;
  });

// ─── Step 2 : Register deep-link URL scheme ───────────────────────────────────

const withURLScheme: ConfigPlugin = (config) =>
  withInfoPlist(config, (cfg) => {
    const types: any[] = cfg.modResults.CFBundleURLTypes ?? [];
    const alreadyHas = types.some((t) =>
      (t.CFBundleURLSchemes ?? []).includes('todaysfamily'),
    );
    if (!alreadyHas) {
      types.push({ CFBundleURLSchemes: ['todaysfamily'] });
    }
    cfg.modResults.CFBundleURLTypes = types;
    return cfg;
  });

// ─── Step 3 : Add ShareExtension Xcode target ────────────────────────────────

const withShareExtensionTarget: ConfigPlugin = (config) =>
  withXcodeProject(config, (cfg) => {
    const proj = cfg.modResults;
    const projectRoot = cfg.modRequest.projectRoot;
    const iosRoot = path.join(projectRoot, 'ios');
    const extDir = path.join(iosRoot, EXTENSION_NAME);

    // The Swift + plist files are already written to ios/ShareExtension/
    // by the generator (or checked in). We just need the Xcode target.

    if (proj.pbxTargetByName(EXTENSION_NAME)) {
      // Already patched — idempotent
      return cfg;
    }

    const mainBundleId: string =
      config.ios?.bundleIdentifier ?? 'com.todaysfamily.app';
    const extBundleId = mainBundleId + BUNDLE_ID_SUFFIX;

    // Add target
    const extTarget = proj.addTarget(
      EXTENSION_NAME,
      'app_extension',
      EXTENSION_NAME,
    );

    // Build settings
    const buildSettings = {
      PRODUCT_NAME: EXTENSION_NAME,
      PRODUCT_BUNDLE_IDENTIFIER: extBundleId,
      SWIFT_VERSION: '5.0',
      IPHONEOS_DEPLOYMENT_TARGET: '15.0',
      INFOPLIST_FILE: `${EXTENSION_NAME}/Info.plist`,
      CODE_SIGN_ENTITLEMENTS: `${EXTENSION_NAME}/${EXTENSION_NAME}.entitlements`,
      SKIP_INSTALL: 'NO',
      APPLICATION_EXTENSION_API_ONLY: 'YES',
    };

    proj.addBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', extBundleId, `${EXTENSION_NAME}Debug`);
    proj.addBuildProperty('PRODUCT_BUNDLE_IDENTIFIER', extBundleId, `${EXTENSION_NAME}Release`);

    Object.entries(buildSettings).forEach(([k, v]) => {
      proj.updateBuildProperty(k, v, `${EXTENSION_NAME}Debug`);
      proj.updateBuildProperty(k, v, `${EXTENSION_NAME}Release`);
    });

    // Add source files to the target
    const files = fs.existsSync(extDir)
      ? fs.readdirSync(extDir).filter((f) => f.endsWith('.swift') || f.endsWith('.m'))
      : ['ShareViewController.swift'];

    files.forEach((file) => {
      proj.addSourceFile(
        `${EXTENSION_NAME}/${file}`,
        { target: extTarget.uuid },
        extTarget.uuid,
      );
    });

    // Add Info.plist as a resource
    proj.addResourceFile(
      `${EXTENSION_NAME}/Info.plist`,
      { target: extTarget.uuid },
      extTarget.uuid,
    );

    // Write extension entitlements file
    const entitlementsPath = path.join(extDir, `${EXTENSION_NAME}.entitlements`);
    if (!fs.existsSync(entitlementsPath)) {
      const entitlementsXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>${APP_GROUP}</string>
    </array>
</dict>
</plist>`;
      fs.mkdirSync(extDir, { recursive: true });
      fs.writeFileSync(entitlementsPath, entitlementsXML, 'utf8');
    }

    return cfg;
  });

// ─── Compose ─────────────────────────────────────────────────────────────────

const withIOSShareExtension: ConfigPlugin = (config) => {
  config = withAppGroupEntitlement(config);
  config = withURLScheme(config);
  config = withShareExtensionTarget(config);
  return config;
};

export default withIOSShareExtension;
