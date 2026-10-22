import { useState, useMemo } from 'react';
import {
  Layers, Plus, Flame, Lock, Unlock, Eye, Shield
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import StatusDot from '../ui/StatusDot';
import { formatCurrency } from '../../utils/formatters';

export default function VirtualCardsTab({
  cards = [],
  onOpenNewCard,
  onOpenBurnerCard,
  onSelectCardDetails,
  onUpdateCard,
  showToast,
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'frozen', 'burner'

  // Filter only virtual protection & demo cards (excluding linked bank cards)
  const virtualCards = useMemo(() => {
    return cards.filter((c) => c.source !== 'bank_connection');
  }, [cards]);

  const filtered = useMemo(() => {
    return virtualCards.filter((card) => {
      if (statusFilter === 'active' && card.isLocked) return false;
      if (statusFilter === 'frozen' && !card.isLocked) return false;
      if (statusFilter === 'burner' && !card.isBurner && card.type !== 'burner') return false;
      return true;
    });
  }, [virtualCards, statusFilter]);

  const activeCount = virtualCards.filter((c) => !c.isLocked).length;
  const frozenCount = virtualCards.filter((c) => c.isLocked).length;

  const handleToggleFreeze = (card) => {
    const next = !card.isLocked;
    onUpdateCard?.(card.id, { isLocked: next });
    showToast?.(`Virtual card "${card.label}" ${next ? 'frozen' : 'unfrozen'}.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Hero Action Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-white tracking-tight">
              Purpose-Specific Virtual Cards
            </h2>
            <Badge variant="indigo" size="xs">
              Hardware Spend Limits Enforced
            </Badge>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Isolate merchants and subscription risks. Every virtual card has an independent per-transaction cap, period budget, and instant pause switch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={Flame}
            onClick={onOpenBurnerCard}
          >
            Create Burner Card
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onOpenNewCard}
          >
            Create Virtual Card
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Virtual ({virtualCards.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'active' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('frozen')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'frozen' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Frozen ({frozenCount})
          </button>
          <button
            onClick={() => setStatusFilter('burner')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'burner' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Burner / Disposable
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          Simulation &amp; Sandbox Rails
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((card) => {
          const isBurner = card.isBurner || card.type === 'burner';
          const isDemo = card.source === 'demo' || !card.source;
          const monthlyLimit = parseFloat(card.monthlyLimit) || 0;
          const spend = parseFloat(card.currentSpend) || 0;
          const percentUsed = monthlyLimit > 0 ? Math.min(100, Math.round((spend / monthlyLimit) * 100)) : 0;

          return (
            <div
              key={card.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                card.isLocked
                  ? 'bg-slate-900/60 border-rose-900/40 opacity-75'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl shadow-black/25'
              }`}
            >
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isBurner
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {isBurner ? <Flame className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {card.label}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {card.type ? `${card.type.toUpperCase()} CARD` : 'VIRTUAL CARD'}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      card.isLocked
                        ? 'rose'
                        : isDemo
                          ? 'demo'
                          : 'enforced'
                    }
                    size="xs"
                  >
                    <StatusDot status={card.isLocked ? 'frozen' : 'active'} className="mr-1" />
                    {card.isLocked ? 'Frozen' : isDemo ? 'Demo Virtual' : 'Enforced'}
                  </Badge>
                </div>

                {/* Masked Card Number Strip */}
                <div className="p-3 my-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="font-mono text-slate-200 font-semibold tracking-wider">
                    •••• {card.last4 || (card.cardNumber ? card.cardNumber.slice(-4) : '4242')}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Exp: {card.expDate || '12/28'}
                  </div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase">
                    {card.brand || 'VISA'}
                  </div>
                </div>

                {/* Spend limit details */}
                <div className="space-y-2 mt-3 text-xs">
                  {monthlyLimit > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Monthly Budget:</span>
                        <span className="font-mono text-slate-200">
                          {formatCurrency(spend)} / {formatCurrency(monthlyLimit)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentUsed > 90 ? 'bg-rose-500' : percentUsed > 70 ? 'bg-amber-400' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {card.perTxLimit > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Max Per Transaction:</span>
                      <span className="font-mono text-slate-300 font-medium">
                        {formatCurrency(card.perTxLimit)}
                      </span>
                    </div>
                  )}

                  {card.merchantLock && (
                    <div className="text-[11px] text-indigo-300 flex items-center gap-1 font-mono pt-1">
                      <Shield className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>Merchant Lock: {card.merchantLock}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Strip */}
              <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  {card.isLocked ? 'Decline All Active' : 'Live Gateway Ready'}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant={card.isLocked ? 'secondary' : 'danger'}
                    size="xs"
                    icon={card.isLocked ? Unlock : Lock}
                    onClick={() => handleToggleFreeze(card)}
                  >
                    {card.isLocked ? 'Unfreeze' : 'Freeze'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="xs"
                    icon={Eye}
                    onClick={() => onSelectCardDetails?.(card)}
                  >
                    Details
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
