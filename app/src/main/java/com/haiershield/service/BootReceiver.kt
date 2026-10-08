package com.haiershield.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.haiershield.data.PrefsManager
import com.haiershield.util.ServiceUtils

class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "BootReceiver"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null) return
        if (intent?.action != Intent.ACTION_BOOT_COMPLETED) return

        val prefs = PrefsManager(context)
        val action = BootDecider.shouldStartServices(
            isSetupComplete = prefs.isSetupComplete,
            isDnsEnabled = prefs.isDnsBlockerEnabled
        )

        Log.i(TAG, "Boot completed. Action: $action")

        when (action) {
            BootAction.START_DNS -> {
                ServiceUtils.startDnsBlocker(context)
                Log.i(TAG, "Started DNS blocker on boot")
            }
            BootAction.SKIP -> {
                Log.i(TAG, "Skipping auto-start: setup not complete or DNS not enabled")
            }
        }
    }

    enum class BootAction { START_DNS, SKIP }

    /**
     * Pure logic for boot decision - testable without Android context.
     */
    object BootDecider {

        fun shouldStartServices(
            isSetupComplete: Boolean,
            isDnsEnabled: Boolean
        ): BootAction {
            if (!isSetupComplete) return BootAction.SKIP
            if (!isDnsEnabled) return BootAction.SKIP
            return BootAction.START_DNS
        }
    }
}
