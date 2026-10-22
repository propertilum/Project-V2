/**
 * CardHub Domain: Connections & Data Providers
 * Tracks Open Banking aggregators (Plaid/Tink) and Virtual Card issuing partners (Stripe Issuing/Lithic).
 */

export const INITIAL_CONNECTIONS = [
  {
    id: 'conn-plaid-demo',
    name: 'Habib Bank (HBL) via Open Banking',
    provider: 'Open Banking Adapter (Sandbox Demo)',
    type: 'bank_aggregator',
    institution: 'Habib Bank Limited',
    accountMask: 'Checking ···· 9102',
    status: 'connected_delayed',
    isDemo: true,
    lastSyncedAt: Date.now() - 1000 * 60 * 60 * 36, // 36 hours ago
    permissions: [
      'Read account balance',
      'Read cleared transactions',
      'Read card metadata',
    ],
    capabilities: [
      { name: 'Transaction monitoring', supported: true, note: 'Settled data refreshed daily' },
      { name: 'Balance synchronization', supported: true, note: 'Updated on bank sync' },
      { name: 'Freeze real bank card', supported: false, note: 'Not permitted by bank open banking API' },
      { name: 'Spend limit enforcement', supported: false, note: 'Monitoring alerts only; cannot decline charges' },
    ],
  },
  {
    id: 'conn-issuer-demo',
    name: 'CardHub Virtual Card Engine',
    provider: 'Financial Infrastructure Sandbox',
    type: 'card_issuer',
    institution: 'CardHub Issuing Partner',
    accountMask: 'Card Pool #US-VIRT-802',
    status: 'connected_current',
    isDemo: true,
    lastSyncedAt: Date.now() - 1000 * 60 * 4, // 4 mins ago
    permissions: [
      'Real-time webhook authorization decisions',
      'Merchant category restrictions',
      'Instant card freeze/unfreeze',
      'Custom budget enforcement',
    ],
    capabilities: [
      { name: 'Instant card generation', supported: true, note: 'Demo mode creates isolated test cards' },
      { name: 'Real-time gateway declines', supported: true, note: 'Enforces limits before charge clears' },
      { name: 'Merchant lock enforcement', supported: true, note: 'Allows only designated merchant' },
      { name: 'Disposable burner lifecycle', supported: true, note: 'Auto-depletes after use or expiration' },
    ],
  },
  {
    id: 'conn-meezan-demo',
    name: 'Meezan Bank Debit',
    provider: 'Direct Financial API (Simulation)',
    type: 'bank_aggregator',
    institution: 'Meezan Bank',
    accountMask: 'Current ···· 3341',
    status: 'connected_current',
    isDemo: true,
    lastSyncedAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
    permissions: [
      'Read transaction history',
      'Read account status',
    ],
    capabilities: [
      { name: 'Transaction monitoring', supported: true, note: 'Real-time webhook events simulated' },
      { name: 'Freeze real bank card', supported: false, note: 'Must use Meezan mobile app to freeze' },
    ],
  },
];

export function syncConnection(connections, connectionId) {
  return connections.map((conn) => {
    if (conn.id === connectionId) {
      return {
        ...conn,
        status: 'connected_current',
        lastSyncedAt: Date.now(),
      };
    }
    return conn;
  });
}

export function disconnectConnection(connections, connectionId) {
  return connections.map((conn) => {
    if (conn.id === connectionId) {
      return {
        ...conn,
        status: 'disconnected',
      };
    }
    return conn;
  });
}
