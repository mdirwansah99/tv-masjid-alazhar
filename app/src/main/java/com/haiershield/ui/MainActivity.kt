package com.haiershield.ui

import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.FragmentActivity
import com.haiershield.R
import com.haiershield.data.PrefsManager

class MainActivity : FragmentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val prefs = PrefsManager(this)

        if (!prefs.isSetupComplete) {
            startActivity(Intent(this, SetupWizardActivity::class.java))
        }

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.main_container, DashboardFragment())
                .commit()
        }
    }
}
