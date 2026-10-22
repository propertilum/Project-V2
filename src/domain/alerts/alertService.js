/**
 * CardHub Domain: Alerts & Risk Response
 * Manages security alerts, severity classification, and response actions.
 */

export const ALERT_SEVERITY = {
  HIGH:   'high',
  MEDIUM: 'medium',
  LOW:    'low',
  INFO:   'info',
};

export const ALERT_STATUS = {
  OPEN:         'open',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED:     'resolved',
};

export const INITIAL_ALERTS = [
  {
    id: 'alt-001',
    cardId: 'card-1',
    cardLabel: 'Habib Bank Primary Credit',
    maskedCard: '•••• 4821',
    type: 'connection_delayed',
    title: 'Bank Data Sync Delayed',
    reason: 'The connection to Habib Bank Limited has not refreshed in 36 hours. Open banking session may require re-authentication.',
    evidenceSummary: 'Last successful sync: Yesterday at 02:14 AM via Open Banking Gateway.',
    severity: ALERT_SEVERITY.MEDIUM,
    status: ALERT_STATUS.OPEN,
    suggestedAction: 'reconnect',
    suggestedActionLabel: 'Re-authenticate Bank',
    timestamp: Date.now() - 1000 * 60 * 60 * 14, // 14h ago
  },
  {
    id: 'alt-002',
    cardId: 'card-3',
    cardLabel: 'E-Commerce Shield Card',
    maskedCard: '•••• 1109',
    type: 'unusual_merchant',
    title: 'Declined: Exceeded Per-Transaction Cap',
    reason: 'A transaction of $289.00 at "TechGadgets Online" was declined by CardHub spending rule (Limit is $150.00).',
    evidenceSummary: 'Attempted authorization for $289.00 on 2026-10-21 19:42 UTC. Enforced at gateway level.',
    severity: ALERT_SEVERITY.HIGH,
    status: ALERT_STATUS.OPEN,
    suggestedAction: 'review_rule',
    suggestedActionLabel: 'Review Spending Limit',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3h ago
  },
  {
    id: 'alt-003',
    cardId: 'card-2',
    cardLabel: 'Cloud & SaaS Billing Card',
    maskedCard: '•••• 8011',
    type: 'recurring_increase',
    title: 'Subscription Price Increase Detected',
    reason: 'Figma monthly renewal increased from $15.00 to $20.00 (+33.3%).',
    evidenceSummary: 'Prior charge $15.00 on Sep 21; new charge $20.00 on Oct 21.',
    severity: ALERT_SEVERITY.LOW,
    status: ALERT_STATUS.OPEN,
    suggestedAction: 'acknowledge',
    suggestedActionLabel: 'Acknowledge Increase',
    timestamp: Date.now() - 1000 * 60 * 60 * 22,
  },
];

export function getUnresolvedAlertsCount(alerts = []) {
  return alerts.filter((a) => a.status === ALERT_STATUS.OPEN).length;
}

export function updateAlertStatus(alerts, alertId, newStatus) {
  return alerts.map((a) => (a.id === alertId ? { ...a, status: newStatus, resolvedAt: Date.now() } : a));
}
