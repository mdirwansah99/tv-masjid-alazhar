package com.haiershield.data

import android.content.Context
import androidx.lifecycle.LiveData
import com.haiershield.data.db.AppDatabase
import com.haiershield.data.db.StatsDao
import com.haiershield.data.db.StatsEntity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.Executors

class StatsTracker(context: Context) {

    private val dao: StatsDao = AppDatabase.getInstance(context).statsDao()
    private val executor = Executors.newSingleThreadExecutor()

    private fun today(): String {
        return SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
    }

    private fun ensureTodayRow() {
        val date = today()
        if (dao.getByDate(date) == null) {
            dao.upsert(StatsEntity(date = date))
        }
    }

    fun recordPopupBlocked() {
        executor.execute {
            ensureTodayRow()
            dao.incrementPopups(today())
        }
    }

    fun recordDnsBlocked() {
        executor.execute {
            ensureTodayRow()
            dao.incrementDns(today())
        }
    }

    fun recordNotifCleared() {
        executor.execute {
            ensureTodayRow()
            dao.incrementNotifs(today())
        }
    }

    fun getTodayStats(): LiveData<StatsEntity?> {
        return dao.getByDateLive(today())
    }

    fun getTodayStatsSync(): StatsEntity? {
        return dao.getByDate(today())
    }
}
