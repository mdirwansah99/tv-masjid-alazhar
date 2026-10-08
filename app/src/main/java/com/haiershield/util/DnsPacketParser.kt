package com.haiershield.util

import java.io.ByteArrayOutputStream

/**
 * Minimal DNS packet parser for extracting query domain names
 * and constructing block responses (A record -> 0.0.0.0).
 *
 * DNS packet format:
 * - Header: 12 bytes (ID[2], Flags[2], QCount[2], ACount[2], NSCount[2], ARCount[2])
 * - Question: Name(variable) + QType[2] + QClass[2]
 * - Name: sequence of (length-byte + label-bytes), terminated by 0x00
 */
object DnsPacketParser {

    private const val HEADER_SIZE = 12
    private const val MAX_LABEL_LENGTH = 63
    private const val MAX_DOMAIN_LENGTH = 253

    /**
     * Extract the queried domain name from a DNS query packet.
     * Returns null if the packet is malformed or too short.
     */
    fun parseDomain(packet: ByteArray): String? {
        if (packet.size < HEADER_SIZE + 1) return null

        try {
            val labels = mutableListOf<String>()
            var offset = HEADER_SIZE
            var totalLength = 0

            while (offset < packet.size) {
                val labelLength = packet[offset].toInt() and 0xFF

                // End of name
                if (labelLength == 0) break

                // Sanity checks
                if (labelLength > MAX_LABEL_LENGTH) return null
                if (offset + 1 + labelLength > packet.size) return null

                val label = String(packet, offset + 1, labelLength, Charsets.US_ASCII)
                labels.add(label)
                totalLength += labelLength + 1
                if (totalLength > MAX_DOMAIN_LENGTH) return null

                offset += 1 + labelLength
            }

            if (labels.isEmpty()) return null
            return labels.joinToString(".").lowercase()
        } catch (e: Exception) {
            return null
        }
    }

    /**
     * Build a DNS response that answers with 0.0.0.0 (block response).
     * Takes the original query packet, flips it to a response,
     * and appends an A record pointing to 0.0.0.0.
     * Returns null if the query packet is malformed.
     */
    fun buildBlockResponse(queryPacket: ByteArray): ByteArray? {
        if (queryPacket.size < HEADER_SIZE + 5) return null

        try {
            val response = ByteArrayOutputStream()

            // Copy transaction ID from query (bytes 0-1)
            response.write(queryPacket, 0, 2)

            // Flags: standard response, no error (0x8180)
            response.write(0x81)
            response.write(0x80)

            // Question count: 1
            response.write(0x00)
            response.write(0x01)

            // Answer count: 1
            response.write(0x00)
            response.write(0x01)

            // Authority count: 0
            response.write(0x00)
            response.write(0x00)

            // Additional count: 0
            response.write(0x00)
            response.write(0x00)

            // Copy the question section from query (name + type + class)
            var questionEnd = HEADER_SIZE
            while (questionEnd < queryPacket.size) {
                val len = queryPacket[questionEnd].toInt() and 0xFF
                if (len == 0) {
                    questionEnd++ // skip null terminator
                    break
                }
                if (questionEnd + 1 + len > queryPacket.size) return null
                questionEnd += 1 + len
            }
            questionEnd += 4 // QType(2) + QClass(2)
            if (questionEnd > queryPacket.size) return null

            response.write(queryPacket, HEADER_SIZE, questionEnd - HEADER_SIZE)

            // Answer section: pointer to name in question (0xC00C)
            response.write(0xC0)
            response.write(0x0C)

            // Type: A (0x0001)
            response.write(0x00)
            response.write(0x01)

            // Class: IN (0x0001)
            response.write(0x00)
            response.write(0x01)

            // TTL: 60 seconds
            response.write(0x00)
            response.write(0x00)
            response.write(0x00)
            response.write(0x3C)

            // Data length: 4 bytes (IPv4)
            response.write(0x00)
            response.write(0x04)

            // Address: 0.0.0.0
            response.write(0x00)
            response.write(0x00)
            response.write(0x00)
            response.write(0x00)

            return response.toByteArray()
        } catch (e: Exception) {
            return null
        }
    }
}
