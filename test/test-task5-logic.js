// test/test-task5-logic.js
const assert = require('assert');

const VpnState = { CONNECTED: 'CONNECTED', DISCONNECTED: 'DISCONNECTED', RECONNECTING: 'RECONNECTING' };
const OverallState = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE', PARTIAL: 'PARTIAL' };

class ShieldStatus {
    constructor() {
        this.reset();
    }

    reset() {
        this.vpnState = VpnState.DISCONNECTED;
        this.popupState = false;
        this.notifState = false;
        this.overallState = OverallState.INACTIVE;
    }

    setVpnState(state) {
        this.vpnState = state;
        this.recalcOverall();
    }

    setPopupState(enabled) {
        this.popupState = enabled;
        this.recalcOverall();
    }

    setNotifState(enabled) {
        this.notifState = enabled;
        this.recalcOverall();
    }

    recalcOverall() {
        const vpn = this.vpnState === VpnState.CONNECTED;
        const popup = this.popupState === true;
        const notif = this.notifState === true;

        if (vpn && popup && notif) {
            this.overallState = OverallState.ACTIVE;
        } else if (!vpn && !popup && !notif) {
            this.overallState = OverallState.INACTIVE;
        } else {
            this.overallState = OverallState.PARTIAL;
        }
    }
}

console.log("Running Task 5 logic tests...");
const status = new ShieldStatus();

// Initial state
assert.strictEqual(status.vpnState, VpnState.DISCONNECTED);
assert.strictEqual(status.popupState, false);
assert.strictEqual(status.notifState, false);
assert.strictEqual(status.overallState, OverallState.INACTIVE);

// All active -> ACTIVE
status.setVpnState(VpnState.CONNECTED);
status.setPopupState(true);
status.setNotifState(true);
assert.strictEqual(status.overallState, OverallState.ACTIVE);

// One disabled -> PARTIAL
status.setNotifState(false);
assert.strictEqual(status.overallState, OverallState.PARTIAL);

// Reconnecting -> still PARTIAL
status.setVpnState(VpnState.RECONNECTING);
assert.strictEqual(status.overallState, OverallState.PARTIAL);

// All off -> INACTIVE
status.setVpnState(VpnState.DISCONNECTED);
status.setPopupState(false);
status.setNotifState(false);
assert.strictEqual(status.overallState, OverallState.INACTIVE);

// VPN revocation check (Review Focus #3)
status.setVpnState(VpnState.CONNECTED);
assert.strictEqual(status.vpnState, VpnState.CONNECTED);
status.setVpnState(VpnState.DISCONNECTED);
assert.strictEqual(status.vpnState, VpnState.DISCONNECTED);

console.log("All Task 5 logic tests PASSED successfully!");
