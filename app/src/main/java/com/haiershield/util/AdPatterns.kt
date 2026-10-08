package com.haiershield.util

object AdPatterns {

    /** Haier packages known to serve advertisements */
    val AD_PACKAGES: Set<String> = setOf(
        "com.haier.advertise",
        "com.haier.ads",
        "com.haier.push",
        "com.haier.ott.ad",
        "com.haier.ott.push",
        "com.haier.smartcare.ad",
        "com.haier.smartcare.push",
        "com.haier.homelet.ad"
    )

    /** Legitimate Haier packages that must never be dismissed */
    val SAFE_PACKAGES: Set<String> = setOf(
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
    )

    /** Text patterns on dismiss buttons (case-insensitive matching) */
    val DISMISS_TEXTS: Set<String> = setOf(
        "close", "×", "✕", "✖", "skip", "dismiss",
        "关闭", "跳过", "取消",
        "tutup", "langkau", "batal",
        "ok", "got it", "no thanks", "not now"
    )

    /** Content-description patterns for dismiss buttons (case-insensitive) */
    val DISMISS_DESCRIPTIONS: Set<String> = setOf(
        "close", "dismiss", "skip", "cancel",
        "close button", "dismiss button", "skip ad"
    )

    /** Keywords indicating a notification is an advertisement (case-insensitive) */
    val AD_NOTIFICATION_KEYWORDS: Set<String> = setOf(
        "promo", "sale", "diskaun", "discount", "offer", "deal",
        "推荐", "优惠", "促销", "限时",
        "limited time", "tawaran", "special offer",
        "shop now", "buy now", "install now", "download now",
        "check out", "don't miss", "exclusive"
    )

    /** System notification categories that must never be cleared */
    val SAFE_NOTIFICATION_CATEGORIES: Set<String> = setOf(
        "sys", "system", "err", "error", "transport",
        "service", "progress", "status"
    )

    /** Check if a package looks like it belongs to Haier */
    fun isHaierPackage(packageName: String?): Boolean {
        if (packageName == null) return false
        return packageName.startsWith("com.haier.")
    }

    /** Check if text contains any ad keyword (case-insensitive) */
    fun containsAdKeyword(text: String?): Boolean {
        if (text.isNullOrBlank()) return false
        val lower = text.lowercase()
        return AD_NOTIFICATION_KEYWORDS.any { lower.contains(it) }
    }

    /** Check if text matches a dismiss button pattern (case-insensitive) */
    fun isDismissText(text: String?): Boolean {
        if (text.isNullOrBlank()) return false
        val lower = text.trim().lowercase()
        return DISMISS_TEXTS.any { lower == it || lower.contains(it) }
    }

    /** Check if content description matches dismiss pattern (case-insensitive) */
    fun isDismissDescription(desc: String?): Boolean {
        if (desc.isNullOrBlank()) return false
        val lower = desc.trim().lowercase()
        return DISMISS_DESCRIPTIONS.any { lower == it || lower.contains(it) }
    }
}
