package com.haiershield.ui

import android.net.VpnService
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import com.haiershield.R
import com.haiershield.data.BlocklistManager
import com.haiershield.data.PrefsManager
import com.haiershield.data.ShieldStatus
import com.haiershield.data.StatsTracker
import com.haiershield.util.ServiceUtils

class DashboardFragment : Fragment() {

    private lateinit var prefsManager: PrefsManager
    private lateinit var statsTracker: StatsTracker
    private lateinit var blocklistManager: BlocklistManager

    private val vpnPrepare = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        if (ServiceUtils.isVpnPrepared(requireContext())) {
            prefsManager.isDnsBlockerEnabled = true
            ServiceUtils.startDnsBlocker(requireContext())
            updateToggleStates()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.fragment_dashboard, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        prefsManager = PrefsManager(requireContext())
        statsTracker = StatsTracker(requireContext())
        blocklistManager = BlocklistManager(requireContext())

        setupMasterToggle(view)
        setupServiceToggles(view)
        setupDomainsButton(view)
        observeStats(view)
        observeStatus(view)
    }

    override fun onResume() {
        super.onResume()
        updateToggleStates()
    }

    private fun setupMasterToggle(view: View) {
        val btn = view.findViewById<Button>(R.id.btn_master_toggle)
        btn.setOnClickListener {
            if (prefsManager.isAnyBlockerEnabled) {
                // Turn all off
                prefsManager.isPopupBlockerEnabled = false
                prefsManager.isDnsBlockerEnabled = false
                prefsManager.isNotifBlockerEnabled = false
                ServiceUtils.stopDnsBlocker(requireContext())
            } else {
                // Turn all on
                if (ServiceUtils.isAccessibilityEnabled(requireContext())) {
                    prefsManager.isPopupBlockerEnabled = true
                }
                val vpnIntent = VpnService.prepare(requireContext())
                if (vpnIntent == null) {
                    prefsManager.isDnsBlockerEnabled = true
                    ServiceUtils.startDnsBlocker(requireContext())
                }
                if (ServiceUtils.isNotificationListenerEnabled(requireContext())) {
                    prefsManager.isNotifBlockerEnabled = true
                }
            }
            updateToggleStates()
        }
    }

    private fun setupServiceToggles(view: View) {
        view.findViewById<Button>(R.id.btn_popup).setOnClickListener {
            if (prefsManager.isPopupBlockerEnabled) {
                prefsManager.isPopupBlockerEnabled = false
            } else {
                if (ServiceUtils.isAccessibilityEnabled(requireContext())) {
                    prefsManager.isPopupBlockerEnabled = true
                } else {
                    ServiceUtils.openAccessibilitySettings(requireContext())
                }
            }
            updateToggleStates()
        }

        view.findViewById<Button>(R.id.btn_dns).setOnClickListener {
            if (prefsManager.isDnsBlockerEnabled) {
                prefsManager.isDnsBlockerEnabled = false
                ServiceUtils.stopDnsBlocker(requireContext())
            } else {
                val intent = VpnService.prepare(requireContext())
                if (intent != null) {
                    vpnPrepare.launch(intent)
                } else {
                    prefsManager.isDnsBlockerEnabled = true
                    ServiceUtils.startDnsBlocker(requireContext())
                }
            }
            updateToggleStates()
        }

        view.findViewById<Button>(R.id.btn_notif).setOnClickListener {
            if (prefsManager.isNotifBlockerEnabled) {
                prefsManager.isNotifBlockerEnabled = false
            } else {
                if (ServiceUtils.isNotificationListenerEnabled(requireContext())) {
                    prefsManager.isNotifBlockerEnabled = true
                } else {
                    ServiceUtils.openNotificationListenerSettings(requireContext())
                }
            }
            updateToggleStates()
        }
    }

    private fun setupDomainsButton(view: View) {
        view.findViewById<Button>(R.id.btn_domains).setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(R.id.main_container, CustomDomainsFragment())
                .addToBackStack(null)
                .commit()
        }
    }

    private fun updateToggleStates() {
        val view = view ?: return

        val popupOn = prefsManager.isPopupBlockerEnabled
        val dnsOn = prefsManager.isDnsBlockerEnabled
        val notifOn = prefsManager.isNotifBlockerEnabled

        view.findViewById<Button>(R.id.btn_popup).text =
            "Popup\n[${if (popupOn) "ON" else "OFF"}]"
        view.findViewById<Button>(R.id.btn_dns).text =
            "DNS\n[${if (dnsOn) "ON" else "OFF"}]"
        view.findViewById<Button>(R.id.btn_notif).text =
            "Notif\n[${if (notifOn) "ON" else "OFF"}]"

        val masterBtn = view.findViewById<Button>(R.id.btn_master_toggle)
        masterBtn.text = if (prefsManager.isAnyBlockerEnabled) "ON" else "OFF"

        val domainCount = blocklistManager.getCustomDomains().size
        view.findViewById<Button>(R.id.btn_domains).text =
            "Domains\n[${domainCount} custom]"
    }

    private fun observeStats(view: View) {
        statsTracker.getTodayStats().observe(viewLifecycleOwner) { stats ->
            view.findViewById<TextView>(R.id.tv_popups_count).text =
                (stats?.popupsBlocked ?: 0).toString()
            view.findViewById<TextView>(R.id.tv_dns_count).text =
                (stats?.dnsBlocked ?: 0).toString()
            view.findViewById<TextView>(R.id.tv_notifs_count).text =
                (stats?.notifsCleared ?: 0).toString()
        }
    }

    private fun observeStatus(view: View) {
        val statusTv = view.findViewById<TextView>(R.id.tv_status)

        ShieldStatus.overallState.observe(viewLifecycleOwner) { state ->
            when (state) {
                ShieldStatus.OverallState.ACTIVE -> {
                    statusTv.text = getString(R.string.status_active)
                    statusTv.setTextColor(resources.getColor(R.color.active_green, null))
                }
                ShieldStatus.OverallState.PARTIAL -> {
                    statusTv.text = getString(R.string.status_partial)
                    statusTv.setTextColor(resources.getColor(R.color.warning_amber, null))
                }
                ShieldStatus.OverallState.INACTIVE -> {
                    statusTv.text = getString(R.string.status_inactive)
                    statusTv.setTextColor(resources.getColor(R.color.inactive_grey, null))
                }
                null -> {}
            }
        }

        ShieldStatus.vpnState.observe(viewLifecycleOwner) { vpnState ->
            if (vpnState == ShieldStatus.VpnState.RECONNECTING) {
                statusTv.text = getString(R.string.vpn_reconnecting)
                statusTv.setTextColor(resources.getColor(R.color.warning_amber, null))
            }
        }
    }
}
