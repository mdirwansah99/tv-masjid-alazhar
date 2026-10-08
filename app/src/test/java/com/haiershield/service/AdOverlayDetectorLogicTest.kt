package com.haiershield.service

import com.haiershield.service.AdOverlayDetector.OverlayAnalyzer
import org.junit.Assert.*
import org.junit.Test

class AdOverlayDetectorLogicTest {

    @Test
    fun `shouldDismissWindow returns true for known ad packages`() {
        assertTrue(OverlayAnalyzer.shouldDismissWindow("com.haier.advertise"))
        assertTrue(OverlayAnalyzer.shouldDismissWindow("com.haier.ads"))
        assertTrue(OverlayAnalyzer.shouldDismissWindow("com.haier.push"))
        assertTrue(OverlayAnalyzer.shouldDismissWindow("com.haier.ott.ad"))
    }

    @Test
    fun `shouldDismissWindow returns false for safe packages`() {
        assertFalse(OverlayAnalyzer.shouldDismissWindow("com.haier.launcher"))
        assertFalse(OverlayAnalyzer.shouldDismissWindow("com.android.tv.settings"))
        assertFalse(OverlayAnalyzer.shouldDismissWindow("com.android.systemui"))
    }

    @Test
    fun `shouldDismissWindow returns false for unknown packages`() {
        assertFalse(OverlayAnalyzer.shouldDismissWindow("com.google.youtube"))
        assertFalse(OverlayAnalyzer.shouldDismissWindow("com.netflix.app"))
    }

    @Test
    fun `shouldDismissWindow returns false for null`() {
        assertFalse(OverlayAnalyzer.shouldDismissWindow(null))
    }

    @Test
    fun `findDismissNode finds close button`() {
        val nodes = listOf(
            Pair("Watch Now", null),
            Pair("Learn More", null),
            Pair("Close", "close button")
        )
        assertEquals(2, OverlayAnalyzer.findDismissNode(nodes))
    }

    @Test
    fun `findDismissNode finds X button`() {
        val nodes = listOf(
            Pair("Ad Title", null),
            Pair("×", null)
        )
        assertEquals(1, OverlayAnalyzer.findDismissNode(nodes))
    }

    @Test
    fun `findDismissNode finds by content description`() {
        val nodes = listOf(
            Pair(null, "play button"),
            Pair(null, "dismiss")
        )
        assertEquals(1, OverlayAnalyzer.findDismissNode(nodes))
    }

    @Test
    fun `findDismissNode returns null when no dismiss found`() {
        val nodes = listOf(
            Pair("Watch Now", "play"),
            Pair("Learn More", "info")
        )
        assertNull(OverlayAnalyzer.findDismissNode(nodes))
    }

    @Test
    fun `findDismissNode returns null for empty list`() {
        assertNull(OverlayAnalyzer.findDismissNode(emptyList()))
    }

    @Test
    fun `findDismissNode returns first match when multiple exist`() {
        val nodes = listOf(
            Pair("Skip", null),
            Pair("Close", null)
        )
        assertEquals(0, OverlayAnalyzer.findDismissNode(nodes))
    }

    @Test
    fun `shouldDismissWindow is consistent - same input same output`() {
        val pkg = "com.haier.advertise"
        assertTrue(OverlayAnalyzer.shouldDismissWindow(pkg))
        assertTrue(OverlayAnalyzer.shouldDismissWindow(pkg))
        assertTrue(OverlayAnalyzer.shouldDismissWindow(pkg))
    }
}
