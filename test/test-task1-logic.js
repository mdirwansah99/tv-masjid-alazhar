// test/test-task1-logic.js
const assert = require('assert');

// Port of AdPatterns logic
const AD_PACKAGES = new Set([
    "com.haier.advertise",
    "com.haier.ads",
    "com.haier.push",
    "com.haier.ott.ad",
    "com.haier.ott.push",
    "com.haier.smartcare.ad",
    "com.haier.smartcare.push",
    "com.haier.homelet.ad"
]);

const SAFE_PACKAGES = new Set([
    "com.haier.settingsservice",
    "com.haier.launcher",
    "com.haier.input",
    "com.haier.hdmi",
    "com.haier.usb",
    "com.haier.bluetooth",
    "com.haier.ota",
    "com.haier.systemupdate",
    "com.android.tv.settings",
    "com.android.systemui"
]);

const DISMISS_TEXTS = new Set([
    "close", "×", "✕", "✖", "skip", "dismiss",
    "关闭", "跳过", "取消",
    "tutup", "langkau", "batal",
    "ok", "got it", "no thanks", "not now"
]);

const DISMISS_DESCRIPTIONS = new Set([
    "close", "dismiss", "skip", "cancel",
    "close button", "dismiss button", "skip ad"
]);

const AD_NOTIFICATION_KEYWORDS = new Set([
    "promo", "sale", "diskaun", "discount", "offer", "deal",
    "推荐", "优惠", "促销", "限时",
    "limited time", "tawaran", "special offer",
    "shop now", "buy now", "install now", "download now",
    "check out", "don't miss", "exclusive"
]);

function isHaierPackage(packageName) {
    if (!packageName) return false;
    return packageName.startsWith("com.haier.");
}

function containsAdKeyword(text) {
    if (!text || !text.trim()) return false;
    const lower = text.toLowerCase();
    for (const kw of AD_NOTIFICATION_KEYWORDS) {
        if (lower.includes(kw)) return true;
    }
    return false;
}

function isDismissText(text) {
    if (!text || !text.trim()) return false;
    const lower = text.trim().toLowerCase();
    for (const dt of DISMISS_TEXTS) {
        if (lower === dt || lower.includes(dt)) return true;
    }
    return false;
}

function isDismissDescription(desc) {
    if (!desc || !desc.trim()) return false;
    const lower = desc.trim().toLowerCase();
    for (const dd of DISMISS_DESCRIPTIONS) {
        if (lower === dd || lower.includes(dd)) return true;
    }
    return false;
}

// BlocklistManager logic
class BlocklistManager {
    constructor() {
        this.DEFAULT_DOMAINS = new Set([
            "ads.haier.com",
            "ad.haier.net",
            "push.haier.com",
            "adsapi.haier.com",
            "tracker.haier.com",
            "analytics.haier.com",
            "adservice.haier.com",
            "log.haier.com",
            "adcdn.haier.com",
            "push.haigeek.com",
            "ad.haigeek.com",
            "stats.haier.com",
            "telemetry.haier.com"
        ]);
        this.customDomains = new Set();
        this.cache = new Set(this.DEFAULT_DOMAINS);
    }

    addCustomDomain(domain) {
        const cleaned = domain.trim().toLowerCase();
        if (!cleaned) return;
        this.customDomains.add(cleaned);
        this.rebuild();
    }

    removeCustomDomain(domain) {
        this.customDomains.delete(domain.trim().toLowerCase());
        this.rebuild();
    }

    resetToDefaults() {
        this.customDomains.clear();
        this.rebuild();
    }

    rebuild() {
        this.cache = new Set([...this.DEFAULT_DOMAINS, ...this.customDomains]);
    }

    isBlocked(domain) {
        const cleaned = domain.trim().toLowerCase();
        if (!cleaned) return false;
        if (this.cache.has(cleaned)) return true;
        for (const blocked of this.cache) {
            if (cleaned.endsWith("." + blocked)) return true;
        }
        return false;
    }
}

console.log("Running Task 1 logic tests...");

// AdPatterns tests
assert.strictEqual(isHaierPackage("com.haier.advertise"), true);
assert.strictEqual(isHaierPackage("com.haier.something.new"), true);
assert.strictEqual(isHaierPackage("com.google.youtube"), false);
assert.strictEqual(isHaierPackage("com.netflix.app"), false);
assert.strictEqual(isHaierPackage(null), false);

assert.strictEqual(containsAdKeyword("Special PROMO for you"), true);
assert.strictEqual(containsAdKeyword("限时优惠"), true);
assert.strictEqual(containsAdKeyword("Don't miss this deal!"), true);
assert.strictEqual(containsAdKeyword("System update available"), false);
assert.strictEqual(containsAdKeyword(null), false);

assert.strictEqual(isDismissText("Close"), true);
assert.strictEqual(isDismissText("×"), true);
assert.strictEqual(isDismissText("SKIP"), true);
assert.strictEqual(isDismissText("关闭"), true);
assert.strictEqual(isDismissText("Watch Now"), false);
assert.strictEqual(isDismissText(null), false);

assert.strictEqual(isDismissDescription("close button"), true);
assert.strictEqual(isDismissDescription("DISMISS"), true);
assert.strictEqual(isDismissDescription("skip ad"), true);
assert.strictEqual(isDismissDescription("play button"), false);
assert.strictEqual(isDismissDescription(null), false);

// Check overlap
for (const p of AD_PACKAGES) {
    assert.strictEqual(SAFE_PACKAGES.has(p), false, "AD_PACKAGES and SAFE_PACKAGES must not overlap");
}

// BlocklistManager tests
const bm = new BlocklistManager();
assert.strictEqual(bm.isBlocked("ads.haier.com"), true);
assert.strictEqual(bm.isBlocked("push.haier.com"), true);
assert.strictEqual(bm.isBlocked("tracker.haier.com"), true);
assert.strictEqual(bm.isBlocked("www.google.com"), false);
assert.strictEqual(bm.isBlocked("haier.com"), false);
assert.strictEqual(bm.isBlocked("sub.ads.haier.com"), true);
assert.strictEqual(bm.isBlocked("deep.sub.tracker.haier.com"), true);

bm.addCustomDomain("custom-ad.example.com");
assert.strictEqual(bm.isBlocked("custom-ad.example.com"), true);

bm.removeCustomDomain("custom-ad.example.com");
assert.strictEqual(bm.isBlocked("custom-ad.example.com"), false);

bm.addCustomDomain("custom.example.com");
bm.resetToDefaults();
assert.strictEqual(bm.isBlocked("custom.example.com"), false);
assert.strictEqual(bm.isBlocked("ads.haier.com"), true);

assert.strictEqual(bm.isBlocked(""), false);
assert.strictEqual(bm.isBlocked("   "), false);
assert.strictEqual(bm.isBlocked("ADS.HAIER.COM"), true);

console.log("All Task 1 logic tests PASSED successfully!");
