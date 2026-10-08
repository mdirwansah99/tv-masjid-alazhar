package com.haiershield.service

import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import com.haiershield.HaierShieldApp
import com.haiershield.R
import com.haiershield.data.BlocklistManager
import com.haiershield.data.PrefsManager
import com.haiershield.data.StatsTracker
import com.haiershield.ui.MainActivity
import com.haiershield.util.DnsPacketParser
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.nio.ByteBuffer
import java.util.concurrent.atomic.AtomicBoolean

class DnsBlockerVpn : VpnService() {

    companion object {
        private const val TAG = "DnsBlockerVpn"
        private const val VPN_ADDRESS = "10.0.0.2"
        private const val VPN_DNS = "10.0.0.1"
        private const val VPN_ROUTE = "0.0.0.0"
        private const val NOTIFICATION_ID = 1
        private const val MAX_PACKET_SIZE = 32767
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private val isRunning = AtomicBoolean(false)
    private lateinit var blocklistManager: BlocklistManager
    private lateinit var statsTracker: StatsTracker
    private lateinit var prefsManager: PrefsManager
    private var vpnThread: Thread? = null

    override fun onCreate() {
        super.onCreate()
        blocklistManager = BlocklistManager(this)
        statsTracker = StatsTracker(this)
        prefsManager = PrefsManager(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (isRunning.get()) return START_STICKY

        startForegroundNotification()
        startVpn()
        return START_STICKY
    }

    override fun onDestroy() {
        stopVpn()
        super.onDestroy()
    }

    override fun onRevoke() {
        Log.w(TAG, "VPN permission revoked")
        stopVpn()
        super.onRevoke()
    }

    private fun startVpn() {
        try {
            val builder = Builder()
                .setSession("HaierShield DNS Blocker")
                .addAddress(VPN_ADDRESS, 32)
                .addDnsServer(VPN_DNS)
                .addRoute(VPN_ROUTE, 0)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                builder.setMetered(false)
            }

            vpnInterface = builder.establish()

            if (vpnInterface == null) {
                Log.e(TAG, "Failed to establish VPN")
                stopSelf()
                return
            }

            isRunning.set(true)
            vpnThread = Thread(::runVpnLoop, "HaierShield-VPN")
            vpnThread?.start()
            Log.i(TAG, "VPN started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting VPN", e)
            stopSelf()
        }
    }

    private fun runVpnLoop() {
        val vpnFd = vpnInterface ?: return
        val input = FileInputStream(vpnFd.fileDescriptor)
        val output = FileOutputStream(vpnFd.fileDescriptor)
        val packet = ByteBuffer.allocate(MAX_PACKET_SIZE)

        try {
            while (isRunning.get()) {
                packet.clear()
                val length = input.read(packet.array())
                if (length <= 0) {
                    Thread.sleep(10)
                    continue
                }

                packet.limit(length)
                handlePacket(packet.array(), length, output)
            }
        } catch (e: InterruptedException) {
            Log.i(TAG, "VPN thread interrupted")
        } catch (e: Exception) {
            Log.e(TAG, "Error in VPN loop", e)
        } finally {
            try { input.close() } catch (_: Exception) {}
            try { output.close() } catch (_: Exception) {}
        }
    }

    private fun handlePacket(data: ByteArray, length: Int, output: FileOutputStream) {
        if (length < 28) return
        val protocol = data[9].toInt() and 0xFF
        if (protocol != 17) return // not UDP

        val ipHeaderLength = (data[0].toInt() and 0x0F) * 4
        if (length < ipHeaderLength + 8) return

        val destPort = ((data[ipHeaderLength + 2].toInt() and 0xFF) shl 8) or
                (data[ipHeaderLength + 3].toInt() and 0xFF)
        if (destPort != 53) return // not DNS

        val udpHeaderLength = 8
        val dnsOffset = ipHeaderLength + udpHeaderLength
        if (dnsOffset >= length) return

        val dnsPayload = data.copyOfRange(dnsOffset, length)
        val domain = DnsPacketParser.parseDomain(dnsPayload) ?: return

        if (blocklistManager.isBlocked(domain)) {
            Log.d(TAG, "Blocked: $domain")
            statsTracker.recordDnsBlocked()

            val blockResponse = DnsPacketParser.buildBlockResponse(dnsPayload)
            if (blockResponse != null) {
                writeResponsePacket(data, ipHeaderLength, blockResponse, output)
            }
        } else {
            forwardDnsQuery(data, length, dnsPayload, ipHeaderLength, output)
        }
    }

    private fun writeResponsePacket(
        originalPacket: ByteArray,
        ipHeaderLength: Int,
        dnsResponse: ByteArray,
        output: FileOutputStream
    ) {
        try {
            val udpLength = 8 + dnsResponse.size
            val totalLength = ipHeaderLength + udpLength
            val response = ByteArray(totalLength)

            System.arraycopy(originalPacket, 0, response, 0, ipHeaderLength)
            System.arraycopy(originalPacket, 12, response, 16, 4) // src -> dst
            System.arraycopy(originalPacket, 16, response, 12, 4) // dst -> src

            response[2] = (totalLength shr 8).toByte()
            response[3] = totalLength.toByte()

            response[ipHeaderLength] = originalPacket[ipHeaderLength + 2]
            response[ipHeaderLength + 1] = originalPacket[ipHeaderLength + 3]
            response[ipHeaderLength + 2] = originalPacket[ipHeaderLength]
            response[ipHeaderLength + 3] = originalPacket[ipHeaderLength + 1]

            response[ipHeaderLength + 4] = (udpLength shr 8).toByte()
            response[ipHeaderLength + 5] = udpLength.toByte()

            response[ipHeaderLength + 6] = 0
            response[ipHeaderLength + 7] = 0

            System.arraycopy(dnsResponse, 0, response, ipHeaderLength + 8, dnsResponse.size)
            recalculateIpChecksum(response, ipHeaderLength)

            output.write(response)
            output.flush()
        } catch (e: Exception) {
            Log.e(TAG, "Error writing response packet", e)
        }
    }

    private fun forwardDnsQuery(
        originalPacket: ByteArray,
        originalLength: Int,
        dnsPayload: ByteArray,
        ipHeaderLength: Int,
        output: FileOutputStream
    ) {
        try {
            val upstreamDns = prefsManager.upstreamDns
            val socket = DatagramSocket()
            protect(socket)

            val address = InetAddress.getByName(upstreamDns)
            val sendPacket = DatagramPacket(dnsPayload, dnsPayload.size, address, 53)
            socket.soTimeout = 5000
            socket.send(sendPacket)

            val responseBuffer = ByteArray(MAX_PACKET_SIZE)
            val receivePacket = DatagramPacket(responseBuffer, responseBuffer.size)
            socket.receive(receivePacket)
            socket.close()

            val dnsResponse = responseBuffer.copyOfRange(0, receivePacket.length)
            writeResponsePacket(originalPacket, ipHeaderLength, dnsResponse, output)
        } catch (e: Exception) {
            Log.e(TAG, "Error forwarding DNS query", e)
        }
    }

    private fun recalculateIpChecksum(packet: ByteArray, headerLength: Int) {
        packet[10] = 0
        packet[11] = 0

        var sum = 0L
        for (i in 0 until headerLength step 2) {
            val word = if (i + 1 < headerLength) {
                ((packet[i].toInt() and 0xFF) shl 8) or (packet[i + 1].toInt() and 0xFF)
            } else {
                (packet[i].toInt() and 0xFF) shl 8
            }
            sum += word
        }

        while (sum shr 16 != 0L) {
            sum = (sum and 0xFFFF) + (sum shr 16)
        }

        val checksum = sum.inv().toInt() and 0xFFFF
        packet[10] = (checksum shr 8).toByte()
        packet[11] = checksum.toByte()
    }

    private fun stopVpn() {
        isRunning.set(false)
        vpnThread?.interrupt()
        vpnThread = null
        try {
            vpnInterface?.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error closing VPN interface", e)
        }
        vpnInterface = null
        stopForeground(true)
        Log.i(TAG, "VPN stopped")
    }

    private fun startForegroundNotification() {
        val pendingIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, HaierShieldApp.CHANNEL_ID)
            .setContentTitle("HaierShield Aktif")
            .setContentText("Penyekat DNS sedang beroperasi")
            .setSmallIcon(R.drawable.ic_shield)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }
}
