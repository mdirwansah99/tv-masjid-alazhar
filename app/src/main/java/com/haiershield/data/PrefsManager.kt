package com.haiershield.data

import android.content.Context
import android.content.SharedPreferences

class PrefsManager(context: Context) {

    companion object {
        private const val PREFS_NAME = "haiershield_prefs"
        private const val KEY_POPUP_ENABLED = "popup_blocker_enabled"
        private const val KEY_DNS_ENABLED = "dns_blocker_enabled"
        private const val KEY_NOTIF_ENABLED = "notif_blocker_enabled"
        private const val KEY_SETUP_COMPLETE = "setup_complete"
        private const val KEY_UPSTREAM_DNS = "upstream_dns"
        private const val DEFAULT_DNS = "8.8.8.8"
    }

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    var isPopupBlockerEnabled: Boolean
        get() = prefs.getBoolean(KEY_POPUP_ENABLED, false)
        set(value) = prefs.edit().putBoolean(KEY_POPUP_ENABLED, value).apply()

    var isDnsBlockerEnabled: Boolean
        get() = prefs.getBoolean(KEY_DNS_ENABLED, false)
        set(value) = prefs.edit().putBoolean(KEY_DNS_ENABLED, value).apply()

    var isNotifBlockerEnabled: Boolean
        get() = prefs.getBoolean(KEY_NOTIF_ENABLED, false)
        set(value) = prefs.edit().putBoolean(KEY_NOTIF_ENABLED, value).apply()

    var isSetupComplete: Boolean
        get() = prefs.getBoolean(KEY_SETUP_COMPLETE, false)
        set(value) = prefs.edit().putBoolean(KEY_SETUP_COMPLETE, value).apply()

    var upstreamDns: String
        get() = prefs.getString(KEY_UPSTREAM_DNS, DEFAULT_DNS) ?: DEFAULT_DNS
        set(value) = prefs.edit().putString(KEY_UPSTREAM_DNS, value).apply()

    /** True if at least one blocker is enabled */
    val isAnyBlockerEnabled: Boolean
        get() = isPopupBlockerEnabled || isDnsBlockerEnabled || isNotifBlockerEnabled

    /** True if all three blockers are enabled */
    val isFullyProtected: Boolean
        get() = isPopupBlockerEnabled && isDnsBlockerEnabled && isNotifBlockerEnabled
}
