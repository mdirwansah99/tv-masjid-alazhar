// test/test-task6-logic.js
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

const SAFE_NOTIFICATION_CATEGORIES = new Set([
    "sys", "system", "err", "error", "transport",
    "service", "progress", "status"
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

const NotifAnalyzer = {
    shouldCancelNotification(packageName, title, text, category) {
        if (!packageName) return false;

        if (category && SAFE_NOTIFICATION_CATEGORIES.has(category.toLowerCase())) {
            return false;
        }

        if (AD_PACKAGES.has(packageName)) return true;

        if (isHaierPackage(packageName)) {
            if (containsAdKeyword(title) || containsAdKeyword(text)) {
                return true;
            }
        }

        return false;
    }
};

console.log("Running Task 6 logic tests...");

// Known ad package
assert.strictEqual(NotifAnalyzer.shouldCancelNotification("com.haier.advertise", "Title", "Body", null), true);

// Keywords in title / text
assert.strictEqual(NotifAnalyzer.shouldCancelNotification("com.haier.something", "Special Promo!", "Check it out", null), true);
assert.strictEqual(NotifAnalyzer.shouldCancelNotification("com.haier.app", "Update", "Limited time offer!", null), true);

// Non-ad system notification
assert.strictEqual(NotifAnalyzer.shouldCancelNotification("com.haier.systemupdate", "System Update", "A new update is available", null), false);

// Non-haier package never cancelled
assert.strictEqual(NotifAnalyzer.shouldCancelNotification("com.google.youtube", "New video!", "Special promo deal!", null), false);

// System category safe
assert.strictEqual(NotifAnalyzer.shouldCancelNotification("com.haier.advertise", "Ad", "Buy now", "sys"), false);
assert.strictEqual(NotifAnalyzer.shouldCancelNotification("com.haier.advertise", "Error", "Something broke", "error"), false);

// Null checks (Review Focus #4)
assert.strictEqual(NotifAnalyzer.shouldCancelNotification(null, "Title", "Body", null), false);
assert.strictEqual(NotifAnalyzer.shouldCancelNotification("com.haier.ads", null, null, null), true);
assert.strictEqual(NotifAnalyzer.shouldCancelNotification("com.haier.settings", null, null, null), false);

// Chinese and Malay keywords
assert.strictEqual(NotifAnalyzer.shouldCancelNotification("com.haier.app", "推荐好物", "限时优惠", null), true);
assert.strictEqual(NotifAnalyzer.shouldCancelNotification("com.haier.store", "Tawaran Istimewa", "Diskaun hebat!", null), true);

console.log("All Task 6 logic tests PASSED successfully!");
