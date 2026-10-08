package com.haiershield.data

import android.content.Context
import android.content.SharedPreferences

class BlocklistManager(context: Context) {

    companion object {
        private const val PREFS_NAME = "haiershield_blocklist"
        private const val KEY_CUSTOM_DOMAINS = "custom_domains"

        private val DEFAULT_DOMAINS: Set<String> = setOf(
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
        )
    }

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private val blockedDomainsCache: HashSet<String> = hashSetOf()

    init {
        rebuildCache()
    }

    fun getDefaultDomains(): Set<String> = DEFAULT_DOMAINS

    fun getCustomDomains(): Set<String> {
        return prefs.getStringSet(KEY_CUSTOM_DOMAINS, emptySet()) ?: emptySet()
    }

    fun getAllBlockedDomains(): Set<String> {
        return DEFAULT_DOMAINS + getCustomDomains()
    }

    fun addCustomDomain(domain: String) {
        val cleaned = domain.trim().lowercase()
        if (cleaned.isEmpty()) return
        val current = getCustomDomains().toMutableSet()
        current.add(cleaned)
        prefs.edit().putStringSet(KEY_CUSTOM_DOMAINS, current).apply()
        rebuildCache()
    }

    fun removeCustomDomain(domain: String) {
        val current = getCustomDomains().toMutableSet()
        current.remove(domain.trim().lowercase())
        prefs.edit().putStringSet(KEY_CUSTOM_DOMAINS, current).apply()
        rebuildCache()
    }

    fun resetToDefaults() {
        prefs.edit().remove(KEY_CUSTOM_DOMAINS).apply()
        rebuildCache()
    }

    /**
     * Check if a domain should be blocked. Supports exact match
     * and wildcard suffix matching (e.g., "sub.ads.haier.com"
     * matches "ads.haier.com").
     */
    fun isBlocked(domain: String): Boolean {
        val cleaned = domain.trim().lowercase()
        if (cleaned.isEmpty()) return false

        // Exact match
        if (blockedDomainsCache.contains(cleaned)) return true

        // Wildcard suffix: check if any blocked domain is a suffix
        return blockedDomainsCache.any { blocked ->
            cleaned.endsWith(".$blocked")
        }
    }

    private fun rebuildCache() {
        blockedDomainsCache.clear()
        blockedDomainsCache.addAll(DEFAULT_DOMAINS)
        blockedDomainsCache.addAll(getCustomDomains())
    }
}
