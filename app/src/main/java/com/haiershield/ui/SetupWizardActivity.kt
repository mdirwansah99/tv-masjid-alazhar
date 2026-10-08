package com.haiershield.ui

import android.os.Bundle
import androidx.fragment.app.FragmentActivity
import com.haiershield.R

class SetupWizardActivity : FragmentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_setup_wizard)

        if (savedInstanceState == null) {
            goToStep(0)
        }
    }

    fun goToStep(step: Int) {
        if (step > 4) {
            finishSetup()
            return
        }
        supportFragmentManager.beginTransaction()
            .replace(R.id.setup_container, SetupStepFragment.newInstance(step))
            .commit()
    }

    fun finishSetup() {
        finish()
    }
}
