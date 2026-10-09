/**
 * cloud.js - Modul Keselamatan PIN & Penyegerakan Awan (Cloud Sync)
 * Masjid Al-Azhar Kampung Sepakat Jaya Sepanggar
 */

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.MasjidCloud = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {

  const DEFAULT_PIN = '123456';
  const STORAGE_KEY_PIN = 'maa_security_pin';
  const STORAGE_KEY_AUTH = 'maa_session_unlocked';
  const STORAGE_KEY_CONFIG = 'maa_cloud_config';

  // 1. KESELAMATAN PIN (PIN PROTECTION)
  function getStoredPin(storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
    if (!storage) return DEFAULT_PIN;
    return storage.getItem(STORAGE_KEY_PIN) || DEFAULT_PIN;
  }

  function setStoredPin(newPin, storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
    if (!storage || !newPin || String(newPin).length < 4) return false;
    storage.setItem(STORAGE_KEY_PIN, String(newPin));
    return true;
  }

  function verifyPin(inputPin, storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
    const current = getStoredPin(storage);
    return String(inputPin).trim() === String(current).trim();
  }

  function isDeviceUnlocked(storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
    if (!storage) return true;
    return storage.getItem(STORAGE_KEY_AUTH) === 'true';
  }

  function setDeviceUnlocked(status, storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
    if (!storage) return;
    if (status) {
      storage.setItem(STORAGE_KEY_AUTH, 'true');
    } else {
      storage.removeItem(STORAGE_KEY_AUTH);
    }
  }

  // 2. TETAPAN & PENGESAHAN KONFIGURASI AWAN (FIREBASE CONFIG)
  function validateCloudConfig(config) {
    if (!config || typeof config !== 'object') {
      return { isValid: false, message: 'Konfigurasi tidak lengkap' };
    }
    if (!config.projectId || !config.apiKey) {
      return { isValid: false, message: 'Project ID dan API Key diperlukan' };
    }
    return { isValid: true, message: 'Konfigurasi sah' };
  }

  function getCloudConfig(storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
    if (!storage) return null;
    const raw = storage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveCloudConfig(config, storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    return true;
  }

  function isCloudEnabled(storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
    const cfg = getCloudConfig(storage);
    return !!(cfg && cfg.enabled && cfg.projectId && cfg.apiKey);
  }

  // 3. FORMAT TRANSAKSI UNTUK FIRESTORE REST API
  function formatTransactionForCloud(tx) {
    return {
      fields: {
        voucherNo: { stringValue: tx.voucherNo || '' },
        date: { stringValue: tx.date || '' },
        type: { stringValue: tx.type || 'EXPENSE' },
        category: { stringValue: tx.category || '' },
        amount: { doubleValue: Number(tx.amount) || 0 },
        payeeOrPayer: { stringValue: tx.payeeOrPayer || '' },
        paymentMethod: { stringValue: tx.paymentMethod || 'Tunai' },
        description: { stringValue: tx.description || '' },
        receiptImage: { stringValue: tx.receiptImage || '' },
        receiptFileName: { stringValue: tx.receiptFileName || '' },
        updatedAt: { stringValue: tx.updatedAt || new Date().toISOString() }
      }
    };
  }

  function parseTransactionFromCloud(doc) {
    if (!doc || !doc.fields) return null;
    const f = doc.fields;
    return {
      voucherNo: f.voucherNo?.stringValue || '',
      date: f.date?.stringValue || '',
      type: f.type?.stringValue || 'EXPENSE',
      category: f.category?.stringValue || '',
      amount: f.amount?.doubleValue ?? Number(f.amount?.integerValue || 0),
      payeeOrPayer: f.payeeOrPayer?.stringValue || '',
      paymentMethod: f.paymentMethod?.stringValue || 'Tunai',
      description: f.description?.stringValue || '',
      receiptImage: f.receiptImage?.stringValue || null,
      receiptFileName: f.receiptFileName?.stringValue || '',
      updatedAt: f.updatedAt?.stringValue || ''
    };
  }

  // 4. PENYEGERAKAN FIRESTORE REST API (BEBAS DEPENDENSI)
  async function fetchCloudTransactions(config) {
    const { projectId, apiKey } = config;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/transactions?key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Ralat status ${res.status}`);
    }

    const data = await res.json();
    if (!data.documents) return [];

    return data.documents.map(parseTransactionFromCloud).filter(Boolean);
  }

  async function pushTransactionToCloud(tx, config) {
    const { projectId, apiKey } = config;
    const docId = tx.voucherNo || `tx_${Date.now()}`;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/transactions/${docId}?key=${apiKey}`;

    const payload = formatTransactionForCloud(tx);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal menyimpan ke awan (${res.status})`);
    }

    return true;
  }

  return {
    getStoredPin,
    setStoredPin,
    verifyPin,
    isDeviceUnlocked,
    setDeviceUnlocked,
    validateCloudConfig,
    getCloudConfig,
    saveCloudConfig,
    isCloudEnabled,
    formatTransactionForCloud,
    parseTransactionFromCloud,
    fetchCloudTransactions,
    pushTransactionToCloud
  };
});
