package com.haiershield.data

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData

/**
 * Observable status of all shield services.
 * Singleton - UI observes this, services update it.
 */
object ShieldStatus {

    enum class VpnState { CONNECTED, DISCONNECTED, RECONNECTING }
    enum class OverallState { ACTIVE, INACTIVE, PARTIAL }

    private val _vpnState = MutableLiveData(VpnState.DISCONNECTED)
    val vpnState: LiveData<VpnState> = _vpnState

    private val _popupState = MutableLiveData(false)
    val popupState: LiveData<Boolean> = _popupState

    private val _notifState = MutableLiveData(false)
    val notifState: LiveData<Boolean> = _notifState

    private val _overallState = MutableLiveData(OverallState.INACTIVE)
    val overallState: LiveData<OverallState> = _overallState

    fun setVpnState(state: VpnState) {
        _vpnState.postValue(state)
        recalcOverall()
    }

    fun setPopupState(enabled: Boolean) {
        _popupState.postValue(enabled)
        recalcOverall()
    }

    fun setNotifState(enabled: Boolean) {
        _notifState.postValue(enabled)
        recalcOverall()
    }

    private fun recalcOverall() {
        val vpn = _vpnState.value == VpnState.CONNECTED
        val popup = _popupState.value == true
        val notif = _notifState.value == true

        val state = when {
            vpn && popup && notif -> OverallState.ACTIVE
            !vpn && !popup && !notif -> OverallState.INACTIVE
            else -> OverallState.PARTIAL
        }
        _overallState.postValue(state)
    }

    /** Reset all states - for testing */
    fun reset() {
        _vpnState.postValue(VpnState.DISCONNECTED)
        _popupState.postValue(false)
        _notifState.postValue(false)
        _overallState.postValue(OverallState.INACTIVE)
    }
}
