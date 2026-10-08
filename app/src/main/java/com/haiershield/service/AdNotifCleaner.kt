package com.haiershield.service

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.haiershield.data.PrefsManager
import com.haiershield.data.ShieldStatus
import com.haiershield.data.StatsTracker
import com.haiershield.util.AdPatterns

class AdNotifCleaner : NotificationListenerService() {

    companion object {
        private const val TAG = "AdNotifCleaner"
    }

    private lateinit var prefsManager: PrefsManager
    private lateinit var statsTracker: StatsTracker

    override fun onListenerConnected() {
        super.onListenerConnected()
        prefsManager = PrefsManager(this)
        statsTracker = StatsTracker(this)
        ShieldStatus.setNotifState(true)
        Log.i(TAG, "AdNotifCleaner connected")
    }

    override fun onListenerDisconnected() {
        ShieldStatus.setNotifState(false)
        Log.i(TAG, "AdNotifCleaner disconnected")
        super.onListenerDisconnected()
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return
        if (!prefsManager.isNotifBlockerEnabled) return

        val packageName = sbn.packageName
        val notification = sbn.notification
        val extras = notification.extras

        val title = extras?.getCharSequence("android.title")?.toString()
        val text = extras?.getCharSequence("android.text")?.toString()
        val category = notification.category

        if (NotifAnalyzer.shouldCancelNotification(packageName, title, text, category)) {
            cancelNotification(sbn.key)
            statsTracker.recordNotifCleared()
            Log.i(TAG, "Cleared ad notification from $packageName: $title")
        }
    }

    /**
     * Static/pure logic extracted for unit testing.
     */
    object NotifAnalyzer {

        fun shouldCancelNotification(
            packageName: String?,
            title: String?,
            text: String?,
            category: String?
        ): Boolean {
            if (packageName == null) return false

            // Never cancel system-category notifications
            if (category != null &&
                AdPatterns.SAFE_NOTIFICATION_CATEGORIES.contains(category.lowercase())
            ) {
                return false
            }

            // Known ad package -> always cancel
            if (AdPatterns.AD_PACKAGES.contains(packageName)) return true

            // Haier package + ad keyword -> cancel
            if (AdPatterns.isHaierPackage(packageName)) {
                if (AdPatterns.containsAdKeyword(title) || AdPatterns.containsAdKeyword(text)) {
                    return true
                }
            }

            return false
        }
    }
}
