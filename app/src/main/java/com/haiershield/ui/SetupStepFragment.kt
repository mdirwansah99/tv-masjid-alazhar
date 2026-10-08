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
import com.haiershield.data.PrefsManager
import com.haiershield.util.ServiceUtils

class SetupStepFragment : Fragment() {

    companion object {
        private const val ARG_STEP = "step"

        fun newInstance(step: Int): SetupStepFragment {
            return SetupStepFragment().apply {
                arguments = Bundle().apply { putInt(ARG_STEP, step) }
            }
        }
    }

    private val step: Int by lazy { arguments?.getInt(ARG_STEP, 0) ?: 0 }
    private lateinit var prefsManager: PrefsManager

    private val vpnPrepare = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        if (ServiceUtils.isVpnPrepared(requireContext())) {
            prefsManager.isDnsBlockerEnabled = true
            ServiceUtils.startDnsBlocker(requireContext())
            showPermissionGranted()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.fragment_setup_step, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        prefsManager = PrefsManager(requireContext())

        val title = view.findViewById<TextView>(R.id.step_title)
        val desc = view.findViewById<TextView>(R.id.step_description)
        val btnAction = view.findViewById<Button>(R.id.btn_action)
        val btnSkip = view.findViewById<Button>(R.id.btn_skip)
        val indicator = view.findViewById<TextView>(R.id.step_indicator)

        indicator.text = "Langkah ${step + 1} daripada 5"

        when (step) {
            0 -> { // Welcome
                title.text = getString(R.string.setup_welcome_title)
                desc.text = getString(R.string.setup_welcome_desc)
                btnAction.text = getString(R.string.get_started)
                btnSkip.visibility = View.GONE
                btnAction.setOnClickListener { goNext() }
            }
            1 -> { // Popup Blocker
                title.text = getString(R.string.setup_step_popup)
                desc.text = "Benarkan HaierShield mengesan dan menutup pop-up iklan secara automatik."
                btnAction.text = getString(R.string.enable)
                btnAction.setOnClickListener {
                    ServiceUtils.openAccessibilitySettings(requireContext())
                }
                btnSkip.setOnClickListener { goNext() }
            }
            2 -> { // DNS Blocker
                title.text = getString(R.string.setup_step_dns)
                desc.text = "Cipta VPN tempatan untuk menyekat domain iklan. Tiada data keluar dari TV anda."
                btnAction.text = getString(R.string.enable)
                btnAction.setOnClickListener {
                    val intent = VpnService.prepare(requireContext())
                    if (intent != null) {
                        vpnPrepare.launch(intent)
                    } else {
                        prefsManager.isDnsBlockerEnabled = true
                        ServiceUtils.startDnsBlocker(requireContext())
                        showPermissionGranted()
                    }
                }
                btnSkip.setOnClickListener { goNext() }
            }
            3 -> { // Notif Blocker
                title.text = getString(R.string.setup_step_notif)
                desc.text = "Benarkan HaierShield membersihkan notifikasi iklan Haier secara automatik."
                btnAction.text = getString(R.string.enable)
                btnAction.setOnClickListener {
                    ServiceUtils.openNotificationListenerSettings(requireContext())
                }
                btnSkip.setOnClickListener { goNext() }
            }
            4 -> { // Done
                title.text = getString(R.string.setup_complete)
                desc.text = "HaierShield kini bersedia melindungi TV anda daripada sebarang iklan."
                btnAction.text = getString(R.string.done)
                btnSkip.visibility = View.GONE
                btnAction.setOnClickListener {
                    prefsManager.isSetupComplete = true
                    (activity as? SetupWizardActivity)?.finishSetup()
                }
            }
        }

        btnAction.requestFocus()
    }

    override fun onResume() {
        super.onResume()
        when (step) {
            1 -> {
                if (ServiceUtils.isAccessibilityEnabled(requireContext())) {
                    prefsManager.isPopupBlockerEnabled = true
                    showPermissionGranted()
                }
            }
            3 -> {
                if (ServiceUtils.isNotificationListenerEnabled(requireContext())) {
                    prefsManager.isNotifBlockerEnabled = true
                    showPermissionGranted()
                }
            }
        }
    }

    private fun showPermissionGranted() {
        view?.findViewById<TextView>(R.id.step_status)?.apply {
            text = "Diaktifkan"
            visibility = View.VISIBLE
        }
        view?.postDelayed({ goNext() }, 1000)
    }

    private fun goNext() {
        (activity as? SetupWizardActivity)?.goToStep(step + 1)
    }
}
