package com.haiershield.util

import org.junit.Assert.*
import org.junit.Test

class AdPatternsTest {

    @Test
    fun `isHaierPackage returns true for haier packages`() {
        assertTrue(AdPatterns.isHaierPackage("com.haier.advertise"))
        assertTrue(AdPatterns.isHaierPackage("com.haier.something.new"))
    }

    @Test
    fun `isHaierPackage returns false for non-haier packages`() {
        assertFalse(AdPatterns.isHaierPackage("com.google.youtube"))
        assertFalse(AdPatterns.isHaierPackage("com.netflix.app"))
        assertFalse(AdPatterns.isHaierPackage(null))
    }

    @Test
    fun `containsAdKeyword detects ad keywords case-insensitively`() {
        assertTrue(AdPatterns.containsAdKeyword("Special PROMO for you"))
        assertTrue(AdPatterns.containsAdKeyword("限时优惠"))
        assertTrue(AdPatterns.containsAdKeyword("Don't miss this deal!"))
    }

    @Test
    fun `containsAdKeyword returns false for normal text`() {
        assertFalse(AdPatterns.containsAdKeyword("System update available"))
        assertFalse(AdPatterns.containsAdKeyword("USB device connected"))
        assertFalse(AdPatterns.containsAdKeyword(null))
        assertFalse(AdPatterns.containsAdKeyword(""))
    }

    @Test
    fun `isDismissText matches dismiss patterns`() {
        assertTrue(AdPatterns.isDismissText("Close"))
        assertTrue(AdPatterns.isDismissText("×"))
        assertTrue(AdPatterns.isDismissText("SKIP"))
        assertTrue(AdPatterns.isDismissText("关闭"))
        assertTrue(AdPatterns.isDismissText("  close  "))
    }

    @Test
    fun `isDismissText rejects non-dismiss text`() {
        assertFalse(AdPatterns.isDismissText("Watch Now"))
        assertFalse(AdPatterns.isDismissText("Learn More"))
        assertFalse(AdPatterns.isDismissText(null))
    }

    @Test
    fun `isDismissDescription matches description patterns`() {
        assertTrue(AdPatterns.isDismissDescription("close button"))
        assertTrue(AdPatterns.isDismissDescription("DISMISS"))
        assertTrue(AdPatterns.isDismissDescription("skip ad"))
    }

    @Test
    fun `isDismissDescription rejects non-dismiss descriptions`() {
        assertFalse(AdPatterns.isDismissDescription("play button"))
        assertFalse(AdPatterns.isDismissDescription(null))
    }

    @Test
    fun `AD_PACKAGES does not overlap with SAFE_PACKAGES`() {
        val overlap = AdPatterns.AD_PACKAGES.intersect(AdPatterns.SAFE_PACKAGES)
        assertTrue("AD_PACKAGES and SAFE_PACKAGES must not overlap: $overlap", overlap.isEmpty())
    }
}
