// test/test-task2-logic.js
const assert = require('assert');

class InMemoryStatsDao {
    constructor() {
        this.rows = new Map();
    }

    getByDate(date) {
        return this.rows.get(date) ? { ...this.rows.get(date) } : null;
    }

    upsert(stats) {
        this.rows.set(stats.date, {
            date: stats.date,
            popupsBlocked: stats.popupsBlocked || 0,
            dnsBlocked: stats.dnsBlocked || 0,
            notifsCleared: stats.notifsCleared || 0
        });
    }

    incrementPopups(date) {
        const row = this.rows.get(date);
        if (!row) return 0;
        row.popupsBlocked += 1;
        return 1;
    }

    incrementDns(date) {
        const row = this.rows.get(date);
        if (!row) return 0;
        row.dnsBlocked += 1;
        return 1;
    }

    incrementNotifs(date) {
        const row = this.rows.get(date);
        if (!row) return 0;
        row.notifsCleared += 1;
        return 1;
    }
}

class StatsTracker {
    constructor(dao) {
        this.dao = dao;
    }

    today() {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    ensureTodayRow() {
        const t = this.today();
        if (!this.dao.getByDate(t)) {
            this.dao.upsert({ date: t });
        }
    }

    recordPopupBlocked() {
        this.ensureTodayRow();
        this.dao.incrementPopups(this.today());
    }

    recordDnsBlocked() {
        this.ensureTodayRow();
        this.dao.incrementDns(this.today());
    }

    recordNotifCleared() {
        this.ensureTodayRow();
        this.dao.incrementNotifs(this.today());
    }

    getTodayStatsSync() {
        return this.dao.getByDate(this.today());
    }
}

console.log("Running Task 2 logic tests...");
const dao = new InMemoryStatsDao();
const tracker = new StatsTracker(dao);

// Initially null
assert.strictEqual(tracker.getTodayStatsSync(), null);

// Record popup
tracker.recordPopupBlocked();
let s = tracker.getTodayStatsSync();
assert.strictEqual(s.popupsBlocked, 1);
assert.strictEqual(s.dnsBlocked, 0);
assert.strictEqual(s.notifsCleared, 0);

// Record another popup and dns
tracker.recordPopupBlocked();
tracker.recordDnsBlocked();
s = tracker.getTodayStatsSync();
assert.strictEqual(s.popupsBlocked, 2);
assert.strictEqual(s.dnsBlocked, 1);
assert.strictEqual(s.notifsCleared, 0);

// Record notifs
tracker.recordNotifCleared();
tracker.recordNotifCleared();
tracker.recordNotifCleared();
s = tracker.getTodayStatsSync();
assert.strictEqual(s.popupsBlocked, 2);
assert.strictEqual(s.dnsBlocked, 1);
assert.strictEqual(s.notifsCleared, 3);

// Date independence
dao.upsert({ date: "2026-01-01", popupsBlocked: 5 });
dao.incrementPopups("2026-01-01");
const oldDate = dao.getByDate("2026-01-01");
assert.strictEqual(oldDate.popupsBlocked, 6);
// today's stats unmodified
assert.strictEqual(tracker.getTodayStatsSync().popupsBlocked, 2);

console.log("All Task 2 logic tests PASSED successfully!");
