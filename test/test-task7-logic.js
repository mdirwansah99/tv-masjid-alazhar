// test/test-task7-logic.js
const assert = require('assert');

const BootAction = {
    START_DNS: 'START_DNS',
    SKIP: 'SKIP'
};

const BootDecider = {
    shouldStartServices(isSetupComplete, isDnsEnabled) {
        if (!isSetupComplete) return BootAction.SKIP;
        if (!isDnsEnabled) return BootAction.SKIP;
        return BootAction.START_DNS;
    }
};

console.log("Running Task 7 logic tests...");

assert.strictEqual(
    BootDecider.shouldStartServices(true, true),
    BootAction.START_DNS
);

assert.strictEqual(
    BootDecider.shouldStartServices(false, true),
    BootAction.SKIP
);

assert.strictEqual(
    BootDecider.shouldStartServices(true, false),
    BootAction.SKIP
);

assert.strictEqual(
    BootDecider.shouldStartServices(false, false),
    BootAction.SKIP
);

console.log("All Task 7 logic tests PASSED successfully!");
