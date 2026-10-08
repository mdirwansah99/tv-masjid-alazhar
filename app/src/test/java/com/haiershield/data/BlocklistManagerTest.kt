package com.haiershield.data

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class BlocklistManagerTest {

    private lateinit var manager: BlocklistManager

    @Before
    fun setUp() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        manager = BlocklistManager(context)
    }

    @Test
    fun `default domains are blocked`() {
        assertTrue(manager.isBlocked("ads.haier.com"))
        assertTrue(manager.isBlocked("push.haier.com"))
        assertTrue(manager.isBlocked("tracker.haier.com"))
    }

    @Test
    fun `non-blocked domains pass through`() {
        assertFalse(manager.isBlocked("www.google.com"))
        assertFalse(manager.isBlocked("netflix.com"))
        assertFalse(manager.isBlocked("haier.com"))
    }

    @Test
    fun `subdomain wildcard matching works`() {
        assertTrue(manager.isBlocked("sub.ads.haier.com"))
        assertTrue(manager.isBlocked("deep.sub.tracker.haier.com"))
    }

    @Test
    fun `add custom domain blocks it`() {
        manager.addCustomDomain("custom-ad.example.com")
        assertTrue(manager.isBlocked("custom-ad.example.com"))
        assertTrue(manager.getCustomDomains().contains("custom-ad.example.com"))
    }

    @Test
    fun `remove custom domain unblocks it`() {
        manager.addCustomDomain("temp-ad.example.com")
        assertTrue(manager.isBlocked("temp-ad.example.com"))
        manager.removeCustomDomain("temp-ad.example.com")
        assertFalse(manager.isBlocked("temp-ad.example.com"))
    }

    @Test
    fun `reset to defaults clears custom domains`() {
        manager.addCustomDomain("custom.example.com")
        manager.resetToDefaults()
        assertFalse(manager.isBlocked("custom.example.com"))
        assertTrue(manager.isBlocked("ads.haier.com"))
    }

    @Test
    fun `empty and blank domains are not blocked`() {
        assertFalse(manager.isBlocked(""))
        assertFalse(manager.isBlocked("   "))
    }

    @Test
    fun `domain matching is case-insensitive`() {
        assertTrue(manager.isBlocked("ADS.HAIER.COM"))
        assertTrue(manager.isBlocked("Ads.Haier.Com"))
    }

    @Test
    fun `adding empty domain is no-op`() {
        val before = manager.getAllBlockedDomains().size
        manager.addCustomDomain("")
        manager.addCustomDomain("   ")
        assertEquals(before, manager.getAllBlockedDomains().size)
    }

    @Test
    fun `getAllBlockedDomains includes defaults and custom`() {
        manager.addCustomDomain("extra.example.com")
        val all = manager.getAllBlockedDomains()
        assertTrue(all.contains("ads.haier.com"))
        assertTrue(all.contains("extra.example.com"))
    }
}
