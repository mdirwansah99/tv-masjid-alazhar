package com.haiershield.data

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.haiershield.data.db.AppDatabase
import com.haiershield.data.db.StatsDao
import com.haiershield.data.db.StatsEntity
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@RunWith(RobolectricTestRunner::class)
class StatsTrackerTest {

    private lateinit var db: AppDatabase
    private lateinit var dao: StatsDao

    private fun today(): String =
        SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())

    @Before
    fun setUp() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        dao = db.statsDao()
    }

    @After
    fun tearDown() {
        db.close()
    }

    @Test
    fun `upsert creates new row`() {
        val entity = StatsEntity(date = today())
        dao.upsert(entity)
        val result = dao.getByDate(today())
        assertNotNull(result)
        assertEquals(0, result!!.popupsBlocked)
        assertEquals(0, result.dnsBlocked)
        assertEquals(0, result.notifsCleared)
    }

    @Test
    fun `incrementPopups increases popup count`() {
        dao.upsert(StatsEntity(date = today()))
        dao.incrementPopups(today())
        dao.incrementPopups(today())
        val result = dao.getByDate(today())
        assertEquals(2, result!!.popupsBlocked)
    }

    @Test
    fun `incrementDns increases dns count`() {
        dao.upsert(StatsEntity(date = today()))
        dao.incrementDns(today())
        val result = dao.getByDate(today())
        assertEquals(1, result!!.dnsBlocked)
    }

    @Test
    fun `incrementNotifs increases notif count`() {
        dao.upsert(StatsEntity(date = today()))
        dao.incrementNotifs(today())
        dao.incrementNotifs(today())
        dao.incrementNotifs(today())
        val result = dao.getByDate(today())
        assertEquals(3, result!!.notifsCleared)
    }

    @Test
    fun `increment on non-existent date returns 0 affected rows`() {
        val affected = dao.incrementPopups("2000-01-01")
        assertEquals(0, affected)
    }

    @Test
    fun `different dates are independent`() {
        dao.upsert(StatsEntity(date = "2026-01-01"))
        dao.upsert(StatsEntity(date = "2026-01-02"))
        dao.incrementPopups("2026-01-01")
        val day1 = dao.getByDate("2026-01-01")
        val day2 = dao.getByDate("2026-01-02")
        assertEquals(1, day1!!.popupsBlocked)
        assertEquals(0, day2!!.popupsBlocked)
    }
}
