import { test, describe } from 'node:test';
import assert from 'node:assert';
import { evaluateTransaction, DECISIONS } from '../src/domain/rules/ruleEngine.js';

describe('Deterministic Rule Engine Tests', () => {
  const baseCard = {
    id: 'card-test-1',
    label: 'Test Virtual Card',
    source: 'cardhub_issuer',
    isLocked: false,
    status: 'active',
    monthlyLimit: 1000,
    perTxLimit: 250,
    merchantLock: 'Netflix',
    allowOnline: true,
    allowInternational: false,
  };

  test('allows transaction matching all rules within limits', () => {
    const tx = {
      id: 'tx-001',
      cardId: 'card-test-1',
      amount: 19.99,
      merchantName: 'Netflix Inc',
      merchantCategory: 'Streaming',
      isOnline: true,
      isInternational: false,
      timestamp: Date.now(),
    };

    const res = evaluateTransaction({
      transaction: tx,
      card: baseCard,
      rules: [],
      recentTransactions: [],
    });

    assert.strictEqual(res.decision, DECISIONS.ALLOWED);
    assert.strictEqual(res.enforcementMode, 'provider_enforced');
  });

  test('declines transaction when card is frozen', () => {
    const frozenCard = { ...baseCard, isLocked: true };
    const tx = {
      id: 'tx-002',
      cardId: 'card-test-1',
      amount: 10.00,
      merchantName: 'Netflix',
      isOnline: true,
      timestamp: Date.now(),
    };

    const res = evaluateTransaction({
      transaction: tx,
      card: frozenCard,
      rules: [],
      recentTransactions: [],
    });

    assert.strictEqual(res.decision, DECISIONS.DECLINED);
    assert.strictEqual(res.ruleId, 'rule-card-frozen');
  });

  test('declines transaction exceeding per-transaction cap', () => {
    const tx = {
      id: 'tx-003',
      cardId: 'card-test-1',
      amount: 250.01, // exceeds 250.00
      merchantName: 'Netflix',
      isOnline: true,
      timestamp: Date.now(),
    };

    const res = evaluateTransaction({
      transaction: tx,
      card: baseCard,
      rules: [],
      recentTransactions: [],
    });

    assert.strictEqual(res.decision, DECISIONS.DECLINED);
    assert.strictEqual(res.ruleId, 'rule-per-tx-limit');
  });

  test('allows transaction exactly at per-transaction cap', () => {
    const tx = {
      id: 'tx-004',
      cardId: 'card-test-1',
      amount: 250.00,
      merchantName: 'Netflix',
      isOnline: true,
      timestamp: Date.now(),
    };

    const res = evaluateTransaction({
      transaction: tx,
      card: baseCard,
      rules: [],
      recentTransactions: [],
    });

    assert.strictEqual(res.decision, DECISIONS.ALLOWED);
  });

  test('declines transaction exceeding monthly cumulative budget', () => {
    const recent = [
      { id: 'h-1', cardId: 'card-test-1', amount: 800, status: 'completed' },
    ];
    const tx = {
      id: 'tx-005',
      cardId: 'card-test-1',
      amount: 201.00, // 800 + 201 = 1001 > 1000 limit
      merchantName: 'Netflix',
      isOnline: true,
      timestamp: Date.now(),
    };

    const res = evaluateTransaction({
      transaction: tx,
      card: baseCard,
      rules: [],
      recentTransactions: recent,
    });

    assert.strictEqual(res.decision, DECISIONS.DECLINED);
    assert.strictEqual(res.ruleId, 'rule-monthly-budget');
  });

  test('declines transaction when merchant does not match merchant lock', () => {
    const tx = {
      id: 'tx-006',
      cardId: 'card-test-1',
      amount: 50.00,
      merchantName: 'Amazon Web Services', // lock is Netflix
      isOnline: true,
      timestamp: Date.now(),
    };

    const res = evaluateTransaction({
      transaction: tx,
      card: baseCard,
      rules: [],
      recentTransactions: [],
    });

    assert.strictEqual(res.decision, DECISIONS.DECLINED);
    assert.strictEqual(res.ruleId, 'rule-merchant-lock');
  });

  test('declines international currency when disabled on card', () => {
    const tx = {
      id: 'tx-007',
      cardId: 'card-test-1',
      amount: 30.00,
      merchantName: 'Netflix',
      isOnline: true,
      isInternational: true, // disabled on baseCard
      timestamp: Date.now(),
    };

    const res = evaluateTransaction({
      transaction: tx,
      card: baseCard,
      rules: [],
      recentTransactions: [],
    });

    assert.strictEqual(res.decision, DECISIONS.DECLINED);
    assert.strictEqual(res.ruleId, 'rule-disallow-international');
  });

  test('flags potential duplicate charge velocity anomaly within 60s', () => {
    const now = Date.now();
    const recent = [
      {
        id: 'h-dup-1',
        cardId: 'card-test-1',
        amount: 19.99,
        merchantName: 'Netflix',
        status: 'completed',
        timestamp: now - 15000, // 15 seconds ago
      },
    ];

    const tx = {
      id: 'tx-008',
      cardId: 'card-test-1',
      amount: 19.99,
      merchantName: 'Netflix',
      isOnline: true,
      timestamp: now,
    };

    const res = evaluateTransaction({
      transaction: tx,
      card: baseCard,
      rules: [],
      recentTransactions: recent,
    });

    assert.strictEqual(res.decision, DECISIONS.FLAGGED);
    assert.strictEqual(res.ruleId, 'rule-velocity-duplicate');
  });

  test('marks bank card evaluation as monitoring_only mode', () => {
    const bankCard = {
      ...baseCard,
      id: 'bank-card-1',
      source: 'bank_connection',
    };

    const tx = {
      id: 'tx-009',
      cardId: 'bank-card-1',
      amount: 10.00,
      merchantName: 'Netflix',
      timestamp: Date.now(),
    };

    const res = evaluateTransaction({
      transaction: tx,
      card: bankCard,
      rules: [],
      recentTransactions: [],
    });

    assert.strictEqual(res.enforcementMode, 'monitoring_only');
  });
});
