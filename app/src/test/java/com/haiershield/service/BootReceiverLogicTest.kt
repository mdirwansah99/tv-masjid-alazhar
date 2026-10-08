package com.haiershield.service

import com.haiershield.service.BootReceiver.BootAction
import com.haiershield.service.BootReceiver.BootDecider
import org.junit.Assert.*
import org.junit.Test

class BootReceiverLogicTest {

    @Test
    fun `starts DNS when setup complete and DNS enabled`() {
        assertEquals(
            BootAction.START_DNS,
            BootDecider.shouldStartServices(isSetupComplete = true, isDnsEnabled = true)
        )
    }

    @Test
    fun `skips when setup not complete`() {
        assertEquals(
            BootAction.SKIP,
            BootDecider.shouldStartServices(isSetupComplete = false, isDnsEnabled = true)
        )
    }

    @Test
    fun `skips when DNS not enabled`() {
        assertEquals(
            BootAction.SKIP,
            BootDecider.shouldStartServices(isSetupComplete = true, isDnsEnabled = false)
        )
    }

    @Test
    fun `skips when nothing enabled and no setup`() {
        assertEquals(
            BootAction.SKIP,
            BootDecider.shouldStartServices(isSetupComplete = false, isDnsEnabled = false)
        )
    }

    @Test
    fun `boot before setup always skips regardless of DNS pref`() {
        assertEquals(
            BootAction.SKIP,
            BootDecider.shouldStartServices(isSetupComplete = false, isDnsEnabled = true)
        )
        assertEquals(
            BootAction.SKIP,
            BootDecider.shouldStartServices(isSetupComplete = false, isDnsEnabled = false)
        )
    }
}
