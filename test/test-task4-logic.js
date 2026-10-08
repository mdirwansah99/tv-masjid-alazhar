// test/test-task4-logic.js
const assert = require('assert');

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

const OverlayAnalyzer = {
    shouldDismissWindow(packageName) {
        if (!packageName) return false;
        if (SAFE_PACKAGES.has(packageName)) return false;
        if (AD_PACKAGES.has(packageName)) return true;
        return false;
    },

    findDismissNode(nodeTexts) {
        for (let i = 0; i < nodeTexts.length; i++) {
            const [text, desc] = nodeTexts[i];
            if (isDismissText(text) || isDismissDescription(desc)) {
                return i;
            }
        }
        return null;
    }
};

console.log("Running Task 4 logic tests...");

// Known ad packages -> true
assert.strictEqual(OverlayAnalyzer.shouldDismissWindow("com.haier.advertise"), true);
assert.strictEqual(OverlayAnalyzer.shouldDismissWindow("com.haier.ads"), true);
assert.strictEqual(OverlayAnalyzer.shouldDismissWindow("com.haier.push"), true);
assert.strictEqual(OverlayAnalyzer.shouldDismissWindow("com.haier.ott.ad"), true);

// Safe packages -> false
assert.strictEqual(OverlayAnalyzer.shouldDismissWindow("com.haier.launcher"), false);
assert.strictEqual(OverlayAnalyzer.shouldDismissWindow("com.android.tv.settings"), false);
assert.strictEqual(OverlayAnalyzer.shouldDismissWindow("com.android.systemui"), false);

// Unknown packages -> false
assert.strictEqual(OverlayAnalyzer.shouldDismissWindow("com.google.youtube"), false);
assert.strictEqual(OverlayAnalyzer.shouldDismissWindow("com.netflix.app"), false);
assert.strictEqual(OverlayAnalyzer.shouldDismissWindow(null), false);

// Find dismiss button
const nodes1 = [
    ["Watch Now", null],
    ["Learn More", null],
    ["Close", "close button"]
];
assert.strictEqual(OverlayAnalyzer.findDismissNode(nodes1), 2);

const nodes2 = [
    ["Ad Title", null],
    ["×", null]
];
assert.strictEqual(OverlayAnalyzer.findDismissNode(nodes2), 1);

const nodes3 = [
    [null, "play button"],
    [null, "dismiss"]
];
assert.strictEqual(OverlayAnalyzer.findDismissNode(nodes3), 1);

assert.strictEqual(OverlayAnalyzer.findDismissNode([["Watch Now", "play"], ["Learn More", "info"]]), null);
assert.strictEqual(OverlayAnalyzer.findDismissNode([]), null);

// Multiple matches returns first match
const nodes4 = [
    ["Skip", null],
    ["Close", null]
];
assert.strictEqual(OverlayAnalyzer.findDismissNode(nodes4), 0);

console.log("All Task 4 logic tests PASSED successfully!");
