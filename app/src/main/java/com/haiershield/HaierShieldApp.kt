package com.haiershield

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

class HaierShieldApp : Application() {

    companion object {
        const val CHANNEL_ID = "haiershield_service"
        const val CHANNEL_NAME = "HaierShield Service"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps HaierShield running in the background"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }
}
