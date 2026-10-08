package com.haiershield.data.db

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface StatsDao {

    @Query("SELECT * FROM daily_stats WHERE date = :date")
    fun getByDate(date: String): StatsEntity?

    @Query("SELECT * FROM daily_stats WHERE date = :date")
    fun getByDateLive(date: String): LiveData<StatsEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun upsert(stats: StatsEntity)

    @Query("UPDATE daily_stats SET popupsBlocked = popupsBlocked + 1 WHERE date = :date")
    fun incrementPopups(date: String): Int

    @Query("UPDATE daily_stats SET dnsBlocked = dnsBlocked + 1 WHERE date = :date")
    fun incrementDns(date: String): Int

    @Query("UPDATE daily_stats SET notifsCleared = notifsCleared + 1 WHERE date = :date")
    fun incrementNotifs(date: String): Int
}
