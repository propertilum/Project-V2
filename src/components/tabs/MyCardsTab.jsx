import { useState, useMemo } from 'react';
import {
  CreditCard, Shield, Lock, Unlock, Eye, Plus,
  Search, Building2
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import StatusDot from '../ui/StatusDot';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';

export default function MyCardsTab({
  cards = [],
  onOpenNewCard,
  onOpenBurnerCard,
  onSelectCardDetails,
  onUpdateCard,
  showToast,
}) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'bank_connection', 'cardhub_issuer', 'demo'

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (sourceFilter !== 'all' && (card.source || 'demo') !== sourceFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchLabel = (card.label || '').toLowerCase().includes(q);
        const matchBrand = (card.brand || '').toLowerCase().includes(q);
        const matchLast4 = (card.last4 || '').includes(q);
        const matchInstitution = (card.institution || '').toLowerCase().includes(q);
        if (!matchLabel && !matchBrand && !matchLast4 && !matchInstitution) return false;
      }
      return true;
    });
  }, [cards, sourceFilter, search]);

  const bankCardsCount = cards.filter((c) => c.source === 'bank_connection').length;
  const virtualCardsCount = cards.filter((c) => c.source === 'cardhub_issuer').length;
  const demoCardsCount = cards.filter((c) => c.source === 'demo' || !c.source).length;

  const handleToggleFreeze = (card) => {
    if (card.source === 'bank_connection') {
      showToast?.('Linked bank cards cannot be frozen by CardHub. Please freeze via your bank app.', 'warning');
      return;
    }
    const nextLocked = !card.isLocked;
    onUpdateCard?.(card.id, { isLocked: nextLocked });
    showToast?.(`Card "${card.label}" ${nextLocked ? 'frozen' : 'unfrozen'}.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & CTAs */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-bold text-white tracking-tight">
              All Connected &amp; Issued Cards
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              ({cards.length} Total Cards)
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Monitor activity across your primary bank cards and control exposure with purpose-specific virtual cards.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={onOpenBurnerCard}
          >
            Create Burner
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onOpenNewCard}
          >
            New Virtual Card
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        {/* Source Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              sourceFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Cards ({cards.length})
          </button>
          <button
            onClick={() => setSourceFilter('bank_connection')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              sourceFilter === 'bank_connection' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Linked Bank Cards ({bankCardsCount})
          </button>
          <button
            onClick={() => setSourceFilter('cardhub_issuer')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              sourceFilter === 'cardhub_issuer' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Virtual Protection ({virtualCardsCount})
          </button>
          <button
            onClick={() => setSourceFilter('demo')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              sourceFilter === 'demo' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demo ({demoCardsCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="w-full bg-slate-900 text-white text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCards.map((card) => {
          const isBankCard = card.source === 'bank_connection';
          const isVirtual = card.source === 'cardhub_issuer';
          const monthlyLimit = parseFloat(card.monthlyLimit) || 0;
          const spend = parseFloat(card.currentSpend) || 0;
          const percentUsed = monthlyLimit > 0 ? Math.min(100, Math.round((spend / monthlyLimit) * 100)) : 0;

          return (
            <div
              key={card.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                card.isLocked
                  ? 'bg-slate-900/60 border-rose-900/40 opacity-80'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-lg shadow-black/20'
              }`}
            >
              {/* Card Header Strip */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isBankCard
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : isVirtual
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {isBankCard ? <Building2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                        {card.label}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {card.institution || (isBankCard ? 'Linked Bank Account' : 'CardHub Virtual Issuer')}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      card.isLocked
                        ? 'rose'
                        : isBankCard
                          ? 'monitoring'
                          : isVirtual
                            ? 'enforced'
                            : 'demo'
                    }
                    size="xs"
                  >
                    <StatusDot status={card.isLocked ? 'frozen' : 'active'} className="mr-1" />
                    {card.isLocked
                      ? 'Frozen'
                      : isBankCard
                        ? 'Monitored'
                        : isVirtual
                          ? 'Active Virtual'
                          : 'Simulation'}
                  </Badge>
                </div>

                {/* Masked Card Details */}
                <div className="p-3 my-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="font-mono text-slate-300 font-semibold tracking-wider">
                    •••• {card.last4 || (card.cardNumber ? card.cardNumber.slice(-4) : '4242')}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Exp: {card.expDate || '12/28'}
                  </div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {card.brand || 'VISA'}
                  </div>
                </div>

                {/* Spend & Limit Progress */}
                {monthlyLimit > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Spend this period:</span>
                      <span className="font-mono font-medium text-slate-200">
                        {formatCurrency(spend)} / {formatCurrency(monthlyLimit)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          percentUsed > 90
                            ? 'bg-rose-500'
                            : percentUsed > 75
                              ? 'bg-amber-400'
                              : 'bg-indigo-500'
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Merchant Lock or Special restrictions */}
                {card.merchantLock && (
                  <div className="mt-2.5 text-[11px] text-indigo-300 flex items-center gap-1 font-mono">
                    <Shield className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>Locked to: {card.merchantLock}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
                <div className="text-[10px] text-slate-500 font-mono">
                  {card.lastSyncedAt ? `Synced ${formatRelativeTime(card.lastSyncedAt)}` : 'Live'}
                </div>

                <div className="flex items-center gap-2">
                  {/* Freeze button for Virtual Cards only */}
                  {!isBankCard ? (
                    <button
                      onClick={() => handleToggleFreeze(card)}
                      className={`p-1.5 rounded-lg border text-xs transition ${
                        card.isLocked
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title={card.isLocked ? 'Unfreeze card' : 'Freeze card'}
                    >
                      {card.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <span
                      className="text-[10px] text-slate-500 cursor-help"
                      title="Bank cards cannot be frozen remotely by CardHub."
                    >
                      Bank Freeze N/A
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="xs"
                    icon={Eye}
                    onClick={() => onSelectCardDetails?.(card)}
                  >
                    Inspect
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
