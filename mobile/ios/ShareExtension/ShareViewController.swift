import UIKit
import Social
import MobileCoreServices
import UniformTypeIdentifiers

/**
 * TodaysFamily Share Extension
 *
 * Receives images or URLs shared from any app (KidsNote, Photos, Safari…),
 * serialises them into the shared App Group UserDefaults, then opens the
 * main app via a custom URL scheme so the upload flow starts automatically.
 *
 * App Group  : group.com.todaysfamily.app
 * URL scheme : todaysfamily://share
 */
class ShareViewController: UIViewController {

    private let appGroupID   = "group.com.todaysfamily.app"
    private let urlScheme    = "todaysfamily://share"
    private let userDefaultsKey = "pendingShareIntent"

    // MARK: - Life cycle

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(white: 0, alpha: 0.01) // near-transparent
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        handleSharedItems()
    }

    // MARK: - Core logic

    private func handleSharedItems() {
        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            cancelWithError("No extension items")
            return
        }

        var imageFilePaths: [String] = []
        var textContent: String?
        let group = DispatchGroup()

        for item in extensionItems {
            for provider in item.attachments ?? [] {

                // ── Image (direct) ─────────────────────────────────────────
                if provider.hasItemConformingToTypeIdentifier(UTType.image.identifier) {
                    group.enter()
                    provider.loadItem(forTypeIdentifier: UTType.image.identifier, options: nil) { [weak self] data, _ in
                        defer { group.leave() }
                        guard let self = self else { return }
                        if let url = data as? URL {
                            if let copied = self.copyToSharedContainer(url: url) {
                                imageFilePaths.append(copied)
                            }
                        } else if let image = data as? UIImage {
                            if let copied = self.saveImageToSharedContainer(image: image) {
                                imageFilePaths.append(copied)
                            }
                        }
                    }
                }

                // ── URL (could be image URL or webpage) ────────────────────
                else if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    group.enter()
                    provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { data, _ in
                        defer { group.leave() }
                        if let url = data as? URL {
                            textContent = url.absoluteString
                        }
                    }
                }

                // ── Plain text ─────────────────────────────────────────────
                else if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    group.enter()
                    provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { data, _ in
                        defer { group.leave() }
                        if let text = data as? String { textContent = text }
                    }
                }
            }
        }

        group.notify(queue: .main) { [weak self] in
            guard let self = self else { return }
            self.persistAndOpen(imagePaths: imageFilePaths, text: textContent)
        }
    }

    // MARK: - Persist to App Group & open main app

    private func persistAndOpen(imagePaths: [String], text: String?) {
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            cancelWithError("Cannot access App Group")
            return
        }

        var payload: [String: Any] = [
            "timestamp": Date().timeIntervalSince1970,
            "uris": imagePaths,
            "type": imagePaths.isEmpty ? "text" : "image",
        ]
        if let t = text { payload["text"] = t }

        defaults.set(payload, forKey: userDefaultsKey)
        defaults.synchronize()

        // Open the main app
        guard let url = URL(string: urlScheme) else { return }
        openMainApp(url: url)
    }

    private func openMainApp(url: URL) {
        // iOS 17+ deprecates openURL on extension context; use responder chain
        var responder: UIResponder? = self
        while responder != nil {
            if let application = responder as? UIApplication {
                application.open(url, options: [:], completionHandler: nil)
                break
            }
            responder = responder?.next
        }
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }

    // MARK: - File helpers

    /// Copy a file:// URL into the shared App Group container
    private func copyToSharedContainer(url: URL) -> String? {
        guard let containerURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupID
        ) else { return nil }

        let ext = url.pathExtension.isEmpty ? "jpg" : url.pathExtension
        let dest = containerURL
            .appendingPathComponent("share")
            .appendingPathComponent("\(UUID().uuidString).\(ext)")

        try? FileManager.default.createDirectory(
            at: dest.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try? FileManager.default.copyItem(at: url, to: dest)
        return dest.path
    }

    /// Save a UIImage into the shared App Group container
    private func saveImageToSharedContainer(image: UIImage) -> String? {
        guard let containerURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupID
        ) else { return nil }

        let dest = containerURL
            .appendingPathComponent("share")
            .appendingPathComponent("\(UUID().uuidString).jpg")

        try? FileManager.default.createDirectory(
            at: dest.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        if let data = image.jpegData(compressionQuality: 0.9) {
            try? data.write(to: dest)
            return dest.path
        }
        return nil
    }

    private func cancelWithError(_ msg: String) {
        extensionContext?.cancelRequest(withError: NSError(
            domain: "com.todaysfamily.share",
            code: -1,
            userInfo: [NSLocalizedDescriptionKey: msg]
        ))
    }
}
