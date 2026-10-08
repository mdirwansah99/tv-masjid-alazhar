package com.haiershield.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.haiershield.data.PrefsManager
import com.haiershield.data.ShieldStatus
import com.haiershield.data.StatsTracker
import com.haiershield.util.AdPatterns

class AdOverlayDetector : AccessibilityService() {

    companion object {
        private const val TAG = "AdOverlayDetector"
        private const val COOLDOWN_MS = 500L
    }

    private lateinit var prefsManager: PrefsManager
    private lateinit var statsTracker: StatsTracker
    private var lastDismissTime: Long = 0

    override fun onServiceConnected() {
        super.onServiceConnected()
        prefsManager = PrefsManager(this)
        statsTracker = StatsTracker(this)
        ShieldStatus.setPopupState(true)

        serviceInfo = serviceInfo.apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                    AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS or
                    AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
            notificationTimeout = 100
        }
        Log.i(TAG, "AdOverlayDetector connected")
    }

    override fun onUnbind(intent: Intent?): Boolean {
        ShieldStatus.setPopupState(false)
        return super.onUnbind(intent)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        if (!prefsManager.isPopupBlockerEnabled) return

        val now = System.currentTimeMillis()
        if (now - lastDismissTime < COOLDOWN_MS) return

        val packageName = event.packageName?.toString()

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                handleWindowEvent(packageName, event)
            }
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                if (packageName != null && OverlayAnalyzer.shouldDismissWindow(packageName)) {
                    handleWindowEvent(packageName, event)
                }
            }
        }
    }

    private fun handleWindowEvent(packageName: String?, event: AccessibilityEvent) {
        if (!OverlayAnalyzer.shouldDismissWindow(packageName)) return

        val rootNode = rootInActiveWindow ?: return

        try {
            if (tryDismissWithNode(rootNode)) {
                lastDismissTime = System.currentTimeMillis()
                statsTracker.recordPopupBlocked()
                Log.i(TAG, "Dismissed ad overlay from: $packageName")
            } else {
                performGlobalAction(GLOBAL_ACTION_BACK)
                lastDismissTime = System.currentTimeMillis()
                statsTracker.recordPopupBlocked()
                Log.i(TAG, "Sent BACK to dismiss ad from: $packageName")
            }
        } finally {
            rootNode.recycle()
        }
    }

    private fun tryDismissWithNode(root: AccessibilityNodeInfo): Boolean {
        val dismissNode = findDismissableNode(root)
        if (dismissNode != null) {
            dismissNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            dismissNode.recycle()
            return true
        }
        return false
    }

    private fun findDismissableNode(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        val text = node.text?.toString()
        val desc = node.contentDescription?.toString()

        if (node.isClickable &&
            (AdPatterns.isDismissText(text) || AdPatterns.isDismissDescription(desc))
        ) {
            return AccessibilityNodeInfo.obtain(node)
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val result = findDismissableNode(child)
            child.recycle()
            if (result != null) return result
        }

        return null
    }

    override fun onInterrupt() {
        Log.w(TAG, "AdOverlayDetector interrupted")
    }

    /**
     * Static/pure logic extracted for unit testing without AccessibilityService context.
     */
    object OverlayAnalyzer {

        fun shouldDismissWindow(packageName: String?): Boolean {
            if (packageName == null) return false
            if (AdPatterns.SAFE_PACKAGES.contains(packageName)) return false
            if (AdPatterns.AD_PACKAGES.contains(packageName)) return true
            return false
        }

        fun findDismissNode(nodeTexts: List<Pair<String?, String?>>): Int? {
            for ((index, pair) in nodeTexts.withIndex()) {
                val (text, desc) = pair
                if (AdPatterns.isDismissText(text) || AdPatterns.isDismissDescription(desc)) {
                    return index
                }
            }
            return null
        }
    }
}
