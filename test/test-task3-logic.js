// test/test-task3-logic.js
const assert = require('assert');

const HEADER_SIZE = 12;
const MAX_LABEL_LENGTH = 63;
const MAX_DOMAIN_LENGTH = 253;

function parseDomain(packet) {
    if (!packet || packet.length < HEADER_SIZE + 1) return null;

    try {
        const labels = [];
        let offset = HEADER_SIZE;
        let totalLength = 0;

        while (offset < packet.length) {
            const labelLength = packet[offset] & 0xFF;
            if (labelLength === 0) break;
            if (labelLength > MAX_LABEL_LENGTH) return null;
            if (offset + 1 + labelLength > packet.length) return null;

            const label = packet.slice(offset + 1, offset + 1 + labelLength).toString('ascii');
            labels.push(label);
            totalLength += labelLength + 1;
            if (totalLength > MAX_DOMAIN_LENGTH) return null;

            offset += 1 + labelLength;
        }

        if (labels.length === 0) return null;
        return labels.join('.').toLowerCase();
    } catch (e) {
        return null;
    }
}

function buildBlockResponse(queryPacket) {
    if (!queryPacket || queryPacket.length < HEADER_SIZE + 5) return null;

    try {
        const buffers = [];

        // Tx ID
        buffers.push(queryPacket.slice(0, 2));

        // Flags: 0x8180
        buffers.push(Buffer.from([0x81, 0x80]));

        // QDCount: 1, ANCount: 1, NSCount: 0, ARCount: 0
        buffers.push(Buffer.from([0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]));

        // Question section
        let questionEnd = HEADER_SIZE;
        while (questionEnd < queryPacket.length) {
            const len = queryPacket[questionEnd] & 0xFF;
            if (len === 0) {
                questionEnd++;
                break;
            }
            if (questionEnd + 1 + len > queryPacket.length) return null;
            questionEnd += 1 + len;
        }
        questionEnd += 4; // Type + Class
        if (questionEnd > queryPacket.length) return null;

        buffers.push(queryPacket.slice(HEADER_SIZE, questionEnd));

        // Answer: pointer 0xC00C, Type A (1), Class IN (1), TTL 60, Len 4, IP 0.0.0.0
        buffers.push(Buffer.from([
            0xC0, 0x0C,
            0x00, 0x01,
            0x00, 0x01,
            0x00, 0x00, 0x00, 0x3C,
            0x00, 0x04,
            0x00, 0x00, 0x00, 0x00
        ]));

        return Buffer.concat(buffers);
    } catch (e) {
        return null;
    }
}

function buildQuery(domain) {
    const parts = domain.split('.');
    const header = Buffer.alloc(12);
    header[4] = 0; header[5] = 1; // 1 question

    const qParts = [];
    for (const part of parts) {
        qParts.push(Buffer.from([part.length]));
        qParts.push(Buffer.from(part, 'ascii'));
    }
    qParts.push(Buffer.from([0])); // null terminator
    qParts.push(Buffer.from([0, 1, 0, 1])); // A record, IN class

    return Buffer.concat([header, ...qParts]);
}

console.log("Running Task 3 logic tests...");

// Standard query
const q1 = buildQuery("ads.haier.com");
assert.strictEqual(parseDomain(q1), "ads.haier.com");

// Subdomain
const q2 = buildQuery("deep.sub.tracker.haier.com");
assert.strictEqual(parseDomain(q2), "deep.sub.tracker.haier.com");

// Uppercase normalised to lowercase
const q3 = buildQuery("ADS.HAIER.COM");
assert.strictEqual(parseDomain(q3), "ads.haier.com");

// Short packets / malformed (Review Focus #1)
assert.strictEqual(parseDomain(Buffer.alloc(5)), null);
assert.strictEqual(parseDomain(Buffer.alloc(12)), null);
assert.strictEqual(parseDomain(Buffer.from([0,0,0,0,0,1,0,0,0,0,0,0, 10, 65])), null); // truncated label
assert.strictEqual(parseDomain(Buffer.concat([Buffer.alloc(12), Buffer.from([64]), Buffer.alloc(64)])), null); // > 63

// Block response synthesis
const resp = buildBlockResponse(q1);
assert.ok(resp);
assert.strictEqual(resp[0], q1[0]);
assert.strictEqual(resp[1], q1[1]);
assert.strictEqual(resp[2], 0x81);
assert.strictEqual(resp[3], 0x80);
assert.strictEqual(resp[6], 0x00);
assert.strictEqual(resp[7], 0x01); // 1 answer

// Last 4 bytes must be 0.0.0.0
const last4 = resp.slice(-4);
assert.deepStrictEqual([...last4], [0, 0, 0, 0]);

console.log("All Task 3 logic tests PASSED successfully!");
