package com.haiershield.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "daily_stats")
data class StatsEntity(
    @PrimaryKey
    val date: String, // "YYYY-MM-DD"
    val popupsBlocked: Int = 0,
    val dnsBlocked: Int = 0,
    val notifsCleared: Int = 0
)
