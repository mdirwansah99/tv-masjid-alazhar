package com.haiershield.service

import com.haiershield.service.AdNotifCleaner.NotifAnalyzer
import org.junit.Assert.*
import org.junit.Test

class AdNotifCleanerLogicTest {

    @Test
    fun `known ad package is always cancelled`() {
        assertTrue(
            NotifAnalyzer.shouldCancelNotification(
                "com.haier.advertise", "Title", "Body", null
            )
        )
    }

    @Test
    fun `haier package with ad keyword in title is cancelled`() {
        assertTrue(
            NotifAnalyzer.shouldCancelNotification(
                "com.haier.something", "Special Promo!", "Check it out", null
            )
        )
    }

    @Test
    fun `haier package with ad keyword in text is cancelled`() {
        assertTrue(
            NotifAnalyzer.shouldCancelNotification(
                "com.haier.app", "Update", "Limited time offer!", null
            )
        )
    }

    @Test
    fun `haier package without ad keywords is not cancelled`() {
        assertFalse(
            NotifAnalyzer.shouldCancelNotification(
                "com.haier.systemupdate", "System Update", "A new update is available", null
            )
        )
    }

    @Test
    fun `non-haier package is never cancelled`() {
        assertFalse(
            NotifAnalyzer.shouldCancelNotification(
                "com.google.youtube", "New video!", "Special promo deal!", null
            )
        )
    }

    @Test
    fun `system category notifications are never cancelled`() {
        assertFalse(
            NotifAnalyzer.shouldCancelNotification(
                "com.haier.advertise", "Ad", "Buy now", "sys"
            )
        )
        assertFalse(
            NotifAnalyzer.shouldCancelNotification(
                "com.haier.advertise", "Error", "Something broke", "error"
            )
        )
    }

    @Test
    fun `null package returns false`() {
        assertFalse(
            NotifAnalyzer.shouldCancelNotification(null, "Title", "Body", null)
        )
    }

    @Test
    fun `null title and text from known ad package is still cancelled`() {
        assertTrue(
            NotifAnalyzer.shouldCancelNotification(
                "com.haier.ads", null, null, null
            )
        )
    }

    @Test
    fun `null title and text from haier non-ad package is not cancelled`() {
        assertFalse(
            NotifAnalyzer.shouldCancelNotification(
                "com.haier.settings", null, null, null
            )
        )
    }

    @Test
    fun `chinese ad keywords are detected`() {
        assertTrue(
            NotifAnalyzer.shouldCancelNotification(
                "com.haier.app", "推荐好物", "限时优惠", null
            )
        )
    }

    @Test
    fun `malay ad keywords are detected`() {
        assertTrue(
            NotifAnalyzer.shouldCancelNotification(
                "com.haier.store", "Tawaran Istimewa", "Diskaun hebat!", null
            )
        )
    }
}
