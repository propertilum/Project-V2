/**
 * CardHub Deterministic Spending Rule & Evaluation Engine
 * Pure domain logic: Evaluates transactions against active card rules and status.
 */

export const DECISIONS = {
  ALLOWED:  'allowed',
  DECLINED: 'declined',
  FLAGGED:  'flagged',
};

export const RULE_ENFORCEMENT = {
  PROVIDER_ENFORCED: 'provider_enforced', // Declines executed at hardware payment gateway
  MONITORING_ONLY:   'monitoring_only',   // Alerts generated after settlement; cannot prevent payment
  DEMO:              'demo',              // Simulated test evaluation
  UNAVAILABLE:       'unavailable',       // Capability not supported
};

/**
 * Evaluates an incoming authorization/simulation transaction against a card and its rules.
 *
 * @param {Object} params
 * @param {Object} params.transaction - { id, amount, currency, merchantName, merchantCategory, isOnline, isInternational, timestamp }
 * @param {Object} params.card - Target card object
 * @param {Array}  params.rules - Active rules array
 * @param {Array}  params.recentTransactions - Historical transactions for period spend & velocity
 * @returns {Object} Evaluation report
 */
export function evaluateTransaction({
  transaction,
  card,
  rules = [],
  recentTransactions = [],
}) {
  const result = {
    decision: DECISIONS.ALLOWED,
    ruleId: null,
    reason: 'Transaction matches all active security rules and card limits.',
    enforcementMode: card.source === 'bank_connection' 
      ? RULE_ENFORCEMENT.MONITORING_ONLY 
      : card.source === 'cardhub_issuer' 
        ? RULE_ENFORCEMENT.PROVIDER_ENFORCED 
        : RULE_ENFORCEMENT.DEMO,
    evaluatedAt: Date.now(),
    details: [],
  };

  if (!card) {
    return {
      ...result,
      decision: DECISIONS.DECLINED,
      reason: 'Target card not found or has been revoked.',
    };
  }

  // 1. Card Frozen / Locked Check
  if (card.isLocked || card.status === 'frozen') {
    return {
      ...result,
      decision: DECISIONS.DECLINED,
      ruleId: 'rule-card-frozen',
      reason: `Card "${card.label || 'Virtual Card'}" is currently frozen. All authorization requests are declined.`,
      details: ['Card status is frozen'],
    };
  }

  // 2. Card Expired Check
  if (card.status === 'expired') {
    return {
      ...result,
      decision: DECISIONS.DECLINED,
      ruleId: 'rule-card-expired',
      reason: 'This card has passed its configured expiration date.',
      details: ['Card expiration exceeded'],
    };
  }

  const txAmount = parseFloat(transaction.amount) || 0;
  const merchant = (transaction.merchantName || '').trim();

  // 3. Online Payments Disabled Check
  if (transaction.isOnline && card.allowOnline === false) {
    return {
      ...result,
      decision: DECISIONS.DECLINED,
      ruleId: 'rule-disallow-online',
      reason: 'E-commerce & online transactions are disabled on this card.',
      details: ['allowOnline = false'],
    };
  }

  // 4. International Payments Disabled Check
  if (transaction.isInternational && card.allowInternational === false) {
    return {
      ...result,
      decision: DECISIONS.DECLINED,
      ruleId: 'rule-disallow-international',
      reason: 'Cross-border / international currency transactions are disabled on this card.',
      details: ['allowInternational = false'],
    };
  }

  // 5. Merchant Lock / Category Restriction Check
  if (card.merchantLock) {
    const lockTarget = card.merchantLock.toLowerCase();
    if (!merchant.toLowerCase().includes(lockTarget)) {
      return {
        ...result,
        decision: DECISIONS.DECLINED,
        ruleId: 'rule-merchant-lock',
        reason: `Merchant lock active: This card is restricted to "${card.merchantLock}". Attempted transaction at "${merchant}" declined.`,
        details: [`Merchant lock target: ${card.merchantLock}`, `Attempted: ${merchant}`],
      };
    }
  }

  // 6. Per-Transaction Limit Check
  const perTxLimit = parseFloat(card.perTxLimit);
  if (perTxLimit > 0 && txAmount > perTxLimit) {
    return {
      ...result,
      decision: DECISIONS.DECLINED,
      ruleId: 'rule-per-tx-limit',
      reason: `Transaction of $${txAmount.toFixed(2)} exceeds the maximum per-transaction cap of $${perTxLimit.toFixed(2)}.`,
      details: [`Requested: $${txAmount.toFixed(2)}`, `Cap: $${perTxLimit.toFixed(2)}`],
    };
  }

  // 7. Monthly Spend Limit / Budget Check
  const monthlyLimit = parseFloat(card.monthlyLimit);
  if (monthlyLimit > 0) {
    const currentMonthSpend = recentTransactions
      .filter((t) => t.cardId === card.id && t.status !== 'declined')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const projectedTotal = currentMonthSpend + txAmount;

    if (projectedTotal > monthlyLimit) {
      return {
        ...result,
        decision: DECISIONS.DECLINED,
        ruleId: 'rule-monthly-budget',
        reason: `Transaction of $${txAmount.toFixed(2)} would exceed monthly budget ($${currentMonthSpend.toFixed(2)} + $${txAmount.toFixed(2)} = $${projectedTotal.toFixed(2)} / limit $${monthlyLimit.toFixed(2)}).`,
        details: [
          `Current period spend: $${currentMonthSpend.toFixed(2)}`,
          `Projected: $${projectedTotal.toFixed(2)}`,
          `Limit: $${monthlyLimit.toFixed(2)}`,
        ],
      };
    }
  }

  // 8. Velocity / Duplicate Charge Check (within 60 seconds)
  const isDuplicate = recentTransactions.some((t) => {
    if (t.cardId !== card.id) return false;
    const sameMerchant = (t.merchant || t.merchantName || '').toLowerCase() === merchant.toLowerCase();
    const sameAmount = Math.abs((parseFloat(t.amount) || 0) - txAmount) < 0.01;
    const timeDiff = Math.abs((transaction.timestamp || Date.now()) - (t.timestamp || 0));
    return sameMerchant && sameAmount && timeDiff < 60000;
  });

  if (isDuplicate) {
    return {
      ...result,
      decision: DECISIONS.FLAGGED,
      ruleId: 'rule-velocity-duplicate',
      reason: `Potential duplicate charge detected: Identical charge of $${txAmount.toFixed(2)} at "${merchant}" occurred within the last 60 seconds.`,
      details: ['Duplicate velocity anomaly'],
    };
  }

  // Check custom spending rules attached to card
  for (const rule of rules) {
    if (!rule.enabled || rule.cardId !== card.id) continue;

    if (rule.type === 'max_per_tx' && txAmount > rule.value) {
      return {
        ...result,
        decision: DECISIONS.DECLINED,
        ruleId: rule.id,
        reason: `Custom rule "${rule.name}": Exceeds maximum limit of $${rule.value.toFixed(2)}.`,
      };
    }

    if (rule.type === 'block_category' && transaction.merchantCategory === rule.value) {
      return {
        ...result,
        decision: DECISIONS.DECLINED,
        ruleId: rule.id,
        reason: `Custom rule "${rule.name}": Category "${rule.value}" is blocked on this card.`,
      };
    }
  }

  return result;
}
