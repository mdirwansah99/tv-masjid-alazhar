package com.haiershield.data

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.haiershield.data.ShieldStatus.OverallState
import com.haiershield.data.ShieldStatus.VpnState
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test

class ShieldStatusTest {

    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()

    @Before
    fun setUp() {
        ShieldStatus.reset()
    }

    @Test
    fun `initial state is all disconnected`() {
        assertEquals(VpnState.DISCONNECTED, ShieldStatus.vpnState.value)
        assertEquals(false, ShieldStatus.popupState.value)
        assertEquals(false, ShieldStatus.notifState.value)
        assertEquals(OverallState.INACTIVE, ShieldStatus.overallState.value)
    }

    @Test
    fun `all services active sets ACTIVE overall`() {
        ShieldStatus.setVpnState(VpnState.CONNECTED)
        ShieldStatus.setPopupState(true)
        ShieldStatus.setNotifState(true)
        assertEquals(OverallState.ACTIVE, ShieldStatus.overallState.value)
    }

    @Test
    fun `some services active sets PARTIAL overall`() {
        ShieldStatus.setVpnState(VpnState.CONNECTED)
        ShieldStatus.setPopupState(true)
        ShieldStatus.setNotifState(false)
        assertEquals(OverallState.PARTIAL, ShieldStatus.overallState.value)
    }

    @Test
    fun `no services active sets INACTIVE overall`() {
        ShieldStatus.setVpnState(VpnState.DISCONNECTED)
        ShieldStatus.setPopupState(false)
        ShieldStatus.setNotifState(false)
        assertEquals(OverallState.INACTIVE, ShieldStatus.overallState.value)
    }

    @Test
    fun `vpn revocation sets DISCONNECTED`() {
        ShieldStatus.setVpnState(VpnState.CONNECTED)
        assertEquals(VpnState.CONNECTED, ShieldStatus.vpnState.value)
        ShieldStatus.setVpnState(VpnState.DISCONNECTED)
        assertEquals(VpnState.DISCONNECTED, ShieldStatus.vpnState.value)
    }

    @Test
    fun `reconnecting state is observable`() {
        ShieldStatus.setVpnState(VpnState.RECONNECTING)
        assertEquals(VpnState.RECONNECTING, ShieldStatus.vpnState.value)
    }
}
