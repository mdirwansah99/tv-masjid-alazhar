package com.haiershield.util

import org.junit.Assert.*
import org.junit.Test

class DnsPacketParserTest {

    /**
     * Build a minimal DNS query packet for testing.
     * Format: 12-byte header + encoded domain name + QType(2) + QClass(2)
     */
    private fun buildDnsQuery(domain: String): ByteArray {
        val parts = domain.split(".")
        val header = ByteArray(12) // transaction ID = 0, flags = 0, qdcount = 1
        header[4] = 0; header[5] = 1 // qdcount = 1

        val nameBytes = mutableListOf<Byte>()
        for (part in parts) {
            nameBytes.add(part.length.toByte())
            nameBytes.addAll(part.toByteArray(Charsets.US_ASCII).toList())
        }
        nameBytes.add(0) // null terminator

        // QType = A (1), QClass = IN (1)
        val footer = byteArrayOf(0, 1, 0, 1)

        return header + nameBytes.toByteArray() + footer
    }

    @Test
    fun `parseDomain extracts simple domain`() {
        val packet = buildDnsQuery("ads.haier.com")
        assertEquals("ads.haier.com", DnsPacketParser.parseDomain(packet))
    }

    @Test
    fun `parseDomain extracts subdomain`() {
        val packet = buildDnsQuery("deep.sub.tracker.haier.com")
        assertEquals("deep.sub.tracker.haier.com", DnsPacketParser.parseDomain(packet))
    }

    @Test
    fun `parseDomain returns lowercase`() {
        val packet = buildDnsQuery("ADS.HAIER.COM")
        assertEquals("ads.haier.com", DnsPacketParser.parseDomain(packet))
    }

    @Test
    fun `parseDomain returns null for packet shorter than header`() {
        assertNull(DnsPacketParser.parseDomain(ByteArray(5)))
        assertNull(DnsPacketParser.parseDomain(ByteArray(12)))
    }

    @Test
    fun `parseDomain returns null for truncated label`() {
        val packet = ByteArray(14)
        packet[12] = 10 // label says 10 bytes but only 1 byte follows
        packet[13] = 65 // 'A'
        assertNull(DnsPacketParser.parseDomain(packet))
    }

    @Test
    fun `parseDomain returns null for label exceeding 63 bytes`() {
        val header = ByteArray(12)
        header[4] = 0; header[5] = 1
        val badLabel = ByteArray(1) { 64.toByte() } + ByteArray(64) { 65.toByte() }
        val packet = header + badLabel
        assertNull(DnsPacketParser.parseDomain(packet))
    }

    @Test
    fun `buildBlockResponse returns valid response for valid query`() {
        val query = buildDnsQuery("ads.haier.com")
        val response = DnsPacketParser.buildBlockResponse(query)
        assertNotNull(response)

        // Transaction ID should match
        assertEquals(query[0], response!![0])
        assertEquals(query[1], response[1])

        // Flags should be 0x8180 (response, no error)
        assertEquals(0x81.toByte(), response[2])
        assertEquals(0x80.toByte(), response[3])

        // Answer count should be 1
        assertEquals(0.toByte(), response[6])
        assertEquals(1.toByte(), response[7])

        // Last 4 bytes should be 0.0.0.0
        val lastFour = response.takeLast(4)
        assertTrue(lastFour.all { it == 0.toByte() })
    }

    @Test
    fun `buildBlockResponse returns null for too-short packet`() {
        assertNull(DnsPacketParser.buildBlockResponse(ByteArray(10)))
    }

    @Test
    fun `buildBlockResponse returns null for malformed question`() {
        val header = ByteArray(12)
        header[4] = 0; header[5] = 1
        val badName = byteArrayOf(50)
        val packet = header + badName
        assertNull(DnsPacketParser.buildBlockResponse(packet))
    }

    @Test
    fun `parseDomain handles empty byte array`() {
        assertNull(DnsPacketParser.parseDomain(ByteArray(0)))
    }
}
