/**
 * CardHub Domain: Card Types & Sources
 * Defines source distinction: bank_connection, cardhub_issuer, demo
 */

export const CARD_SOURCES = {
  BANK_CONNECTION: 'bank_connection', // Monitored linked real card via data provider (e.g. Plaid/Tink)
  CARDHUB_ISSUER:  'cardhub_issuer',  // Issuer-backed virtual card with real hardware controls
  DEMO:            'demo',            // Fictional simulation card for testing & preview
};

export const CARD_STATUSES = {
  ACTIVE:       'active',
  FROZEN:       'frozen',
  EXPIRED:      'expired',
  BLOCKED:      'blocked',
  UNKNOWN:      'unknown',
  DISCONNECTED: 'disconnected',
};

export const CONNECTION_STATUSES = {
  CONNECTED_CURRENT: 'connected_current', // Data is real-time and fresh
  CONNECTED_DELAYED: 'connected_delayed', // Stale sync (> 24h)
  DISCONNECTED:      'disconnected',      // Auth token revoked or expired
  DEMO:              'demo',              // Simulated feed
  LIMITED:           'limited',           // Partial data available from provider
};

/**
 * Returns capability flags for a card based on its source & provider.
 * Enforces rule: "Never show freeze for a real bank card unless provider explicitly supports it."
 */
export function getCardCapabilities(card) {
  const source = card.source || CARD_SOURCES.DEMO;

  if (source === CARD_SOURCES.BANK_CONNECTION) {
    return {
      canFreeze: false,                // Real bank cards cannot be frozen by CardHub
      freezeReason: 'Real bank cards must be frozen directly through your issuing bank app.',
      canSetSpendLimit: false,         // Bank enforces limits, CardHub monitors only
      limitReason: 'Spend limits on linked bank cards are monitored only; declines are not enforced.',
      canMerchantLock: false,
      isEnforcedByProvider: false,
      isMonitoringOnly: true,
      canSimulateTransactions: false,
    };
  }

  if (source === CARD_SOURCES.CARDHUB_ISSUER) {
    return {
      canFreeze: true,
      freezeReason: null,
      canSetSpendLimit: true,
      limitReason: null,
      canMerchantLock: true,
      isEnforcedByProvider: true,
      isMonitoringOnly: false,
      canSimulateTransactions: false,
    };
  }

  // DEMO card
  return {
    canFreeze: true,
    freezeReason: null,
    canSetSpendLimit: true,
    limitReason: null,
    canMerchantLock: true,
    isEnforcedByProvider: false,
    isMonitoringOnly: false,
    isDemoOnly: true,
    canSimulateTransactions: true,
  };
}

/**
 * Safe card number masking - never exposes full PAN
 * Example: "•••• 4821"
 */
export function maskCardNumber(cardNumber, last4 = null) {
  if (last4) return `•••• ${last4}`;
  if (!cardNumber) return '•••• ••••';
  const clean = String(cardNumber).replace(/\s+/g, '');
  const digits = clean.slice(-4);
  return `•••• ${digits || '••••'}`;
}
