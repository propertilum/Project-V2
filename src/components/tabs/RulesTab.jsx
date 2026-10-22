import { useState } from 'react';
import {
  Shield, CheckCircle2, XCircle, AlertTriangle, Play,
  Plus, Sparkles, Filter
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { evaluateTransaction, DECISIONS } from '../../domain/rules/ruleEngine';

export default function RulesTab({
  rules = [],
  cards = [],
  transactions = [],
  onAddRule,
  onToggleRule,
  showToast,
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'enforced', 'monitoring'
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);

  // Simulation State
  const [simCardId, setSimCardId] = useState(cards[0]?.id || '');
  const [simMerchant, setSimMerchant] = useState('Netflix');
  const [simAmount, setSimAmount] = useState('19.99');
  const [simCategory, setSimCategory] = useState('Streaming');
  const [simIsOnline, setSimIsOnline] = useState(true);
  const [simIsInternational, setSimIsInternational] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const activeCard = cards.find((c) => c.id === simCardId) || cards[0];

  const handleRunSimulation = (e) => {
    e.preventDefault();
    if (!activeCard) {
      showToast?.('Please select or create a card to simulate.', 'warning');
      return;
    }

    const testTx = {
      id: `sim-${Date.now()}`,
      cardId: activeCard.id,
      amount: parseFloat(simAmount) || 0,
      currency: 'USD',
      merchantName: simMerchant,
      merchantCategory: simCategory,
      isOnline: simIsOnline,
      isInternational: simIsInternational,
      timestamp: Date.now(),
    };

    const evaluation = evaluateTransaction({
      transaction: testTx,
      card: activeCard,
      rules: rules,
      recentTransactions: transactions,
    });

    setSimResult({
      ...evaluation,
      transaction: testTx,
    });

    showToast?.('Transaction evaluated through deterministic rule engine.', 'info');
  };

  const filteredRules = rules.filter((r) => {
    if (filterMode === 'enforced') return r.enforcementMode === 'provider_enforced';
    if (filterMode === 'monitoring') return r.enforcementMode === 'monitoring_only';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Explanation Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Spending Controls &amp; Enforcement Policy
            </h2>
            <Badge variant="indigo" size="xs">Deterministic Engine</Badge>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            CardHub distinguishes between <strong>Provider Enforced</strong> rules (which decline transactions at the hardware processor level) and <strong>Monitoring Only</strong> rules (which alert after settlement but cannot decline linked bank charges).
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={() => setIsNewRuleOpen(true)}
        >
          Create Spending Rule
        </Button>
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-900/50 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Interactive Transaction Simulator</h3>
              <p className="text-xs text-slate-400">
                Preview how an authorization event will be handled by active rules
              </p>
            </div>
          </div>
          <Badge variant="demo" size="xs">Sandbox Tool</Badge>
        </div>

        <form onSubmit={handleRunSimulation} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Select Card */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Target Card
            </label>
            <select
              value={simCardId}
              onChange={(e) => setSimCardId(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.label} ({card.source === 'bank_connection' ? 'Bank Card' : 'Virtual'} ···{card.last4 || '4242'})
                </option>
              ))}
            </select>
          </div>

          {/* Merchant Name */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Merchant Name
            </label>
            <input
              type="text"
              value={simMerchant}
              onChange={(e) => setSimMerchant(e.target.value)}
              placeholder="e.g. Netflix, Amazon, Unknown Shop"
              className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Authorization Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Merchant Category
            </label>
            <select
              value={simCategory}
              onChange={(e) => setSimCategory(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="Streaming">Streaming &amp; Subscriptions</option>
              <option value="E-Commerce">E-Commerce &amp; Retail</option>
              <option value="Travel">Airlines &amp; Hotels</option>
              <option value="Software">Developer Tools &amp; Cloud</option>
              <option value="High Risk">High Risk / Unverified</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-6 pt-1 text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={simIsOnline}
                onChange={(e) => setSimIsOnline(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>Online / E-Commerce Purchase</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={simIsInternational}
                onChange={(e) => setSimIsInternational(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>International Currency</span>
            </label>
          </div>

          {/* Run Button */}
          <div className="flex items-end justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Sparkles}
              className="w-full"
            >
              Simulate Authorization
            </Button>
          </div>
        </form>

        {/* Simulation Result Panel */}
        {simResult && (
          <div className={`mt-5 p-4 rounded-xl border transition-all text-xs ${
            simResult.decision === DECISIONS.ALLOWED
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
              : simResult.decision === DECISIONS.DECLINED
                ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-current/20">
              <div className="flex items-center gap-2">
                {simResult.decision === DECISIONS.ALLOWED ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : simResult.decision === DECISIONS.DECLINED ? (
                  <XCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <span className="font-bold tracking-tight uppercase">
                  Simulation Outcome: {simResult.decision}
                </span>
              </div>
              <Badge variant={simResult.enforcementMode === 'provider_enforced' ? 'enforced' : 'monitoring'} size="xs">
                {simResult.enforcementMode === 'provider_enforced' ? 'Hardware Declines Enforced' : 'Monitored Post-Settlement'}
              </Badge>
            </div>

            <p className="font-medium mb-2 leading-relaxed">
              {simResult.reason}
            </p>

            <div className="text-[11px] opacity-80 font-mono space-y-0.5">
              <div>Card: {activeCard?.label} (···{activeCard?.last4 || '4242'})</div>
              <div>Simulated Request: ${parseFloat(simAmount).toFixed(2)} at &quot;{simMerchant}&quot;</div>
              <div className="text-[10px] opacity-70 mt-1">
                Note: This simulation evaluates local domain policy against recent totals and does not transmit to live banking rails.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rules Filter Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-300">Active Rules ({filteredRules.length})</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              filterMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Rules
          </button>
          <button
            onClick={() => setFilterMode('enforced')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              filterMode === 'enforced' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Enforced by Provider
          </button>
          <button
            onClick={() => setFilterMode('monitoring')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              filterMode === 'monitoring' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monitoring Only
          </button>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.map((rule) => {
          const isEnforced = rule.enforcementMode === 'provider_enforced';
          const isDemo = rule.enforcementMode === 'demo';

          return (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border bg-slate-900 transition-all ${
                rule.enabled ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white tracking-tight">
                      {rule.name}
                    </span>
                    <Badge
                      variant={
                        isEnforced
                          ? 'enforced'
                          : isDemo
                            ? 'demo'
                            : 'monitoring'
                      }
                      size="xs"
                    >
                      {isEnforced
                        ? 'Enforced by Provider'
                        : isDemo
                          ? 'Demo Simulation'
                          : 'Monitoring Only'}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      · {rule.cardLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onToggleRule?.(rule.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      rule.enabled
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Paused'}
                  </button>
                </div>
              </div>

              {!isEnforced && !isDemo && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-amber-400/90 flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Monitoring-only rule: Can trigger an alert in CardHub, but cannot block the transaction at the bank.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Rule Modal */}
      {isNewRuleOpen && (
        <CreateRuleModal
          cards={cards}
          onClose={() => setIsNewRuleOpen(false)}
          onAddRule={(newRule) => {
            onAddRule?.(newRule);
            setIsNewRuleOpen(false);
            showToast?.(`Rule "${newRule.name}" created!`, 'success');
          }}
        />
      )}
    </div>
  );
}

function CreateRuleModal({ cards, onClose, onAddRule }) {
  const [name, setName] = useState('');
  const [cardId, setCardId] = useState(cards[0]?.id || '');
  const [ruleType, setRuleType] = useState('max_per_tx');
  const [value, setValue] = useState('200');

  const selectedCard = cards.find((c) => c.id === cardId);
  const isBankCard = selectedCard?.source === 'bank_connection';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddRule({
      id: `rule-${Date.now()}`,
      name: name.trim(),
      description: `Enforce ${ruleType.replace(/_/g, ' ')} limit of $${parseFloat(value).toFixed(2)} on ${selectedCard?.label}`,
      cardId,
      cardLabel: selectedCard?.label || 'Virtual Card',
      type: ruleType,
      value: parseFloat(value) || 0,
      enforcementMode: isBankCard ? 'monitoring_only' : 'provider_enforced',
      enabled: true,
      createdAt: Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Create Spending Rule</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Rule Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AWS Billing Hard Cap"
              className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Target Card</label>
              <select
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.source === 'bank_connection' ? 'Bank' : 'Virtual'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Rule Type</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="max_per_tx">Maximum Per Transaction</option>
                <option value="monthly_budget">Monthly Budget Cap</option>
                <option value="lifetime_budget">Lifetime Budget</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Threshold Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Transparent Enforcement Mode Notice */}
          <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
            isBankCard
              ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
              : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
          }`}>
            <span className="font-bold block mb-0.5">
              Enforcement Mode: {isBankCard ? 'Monitoring Only' : 'Hardware Provider Enforced'}
            </span>
            {isBankCard
              ? 'This is a linked bank card. CardHub will trigger security alerts if this limit is passed, but cannot decline the payment at your bank.'
              : 'This is a CardHub virtual card. Transactions exceeding this limit will be declined in real-time by the issuing gateway.'}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Rule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
