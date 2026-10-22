import { 
  Shield, CheckCircle, Lock, Unlock, Flame 
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

export default function SubscriptionsTab({
  subscriptions = [],
  cards = [],
  onFreezeCard,
  onOpenBurnerCard,
  onFilterMerchantHistory,
}) {
  const totalMonthly = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, s) => acc + (parseFloat(s.monthlyCost) || 0), 0);

  const totalAnnual = totalMonthly * 12;

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Monthly Subscription Outflow
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(totalMonthly)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Auto-renewing recurring commitments</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Projected Annual Run-Rate
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(totalAnnual)}
          </div>
          <span className="text-[10px] text-indigo-400 font-bold">12-month recurring projection</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Monitored Services
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {subscriptions.length} Services
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
            <CheckCircle className="w-3 h-3" /> Bound to purpose virtual cards
          </span>
        </div>
      </div>

      {/* 2. Intelligence Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 text-slate-300 text-xs">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sm text-white">Recurring Exposure Isolation</span>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            CardHub detects recurring merchant billing signatures. If an online provider attempts an unannounced price hike or makes subscription cancellation difficult, freezing the card here immediately drops all subsequent authorizations with zero risk to your other cards.
          </p>
        </div>
      </div>

      {/* 3. Subscriptions Detailed Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Detected Recurring Charges</h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated detection from merchant billing patterns</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={Flame}
            onClick={onOpenBurnerCard}
          >
            Protect Trial with Burner
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3 px-5">Service &amp; Provider</th>
                <th className="py-3 px-4">Billing Frequency</th>
                <th className="py-3 px-4">Next Renewal</th>
                <th className="py-3 px-4">Linked Virtual Card</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th className="py-3 px-5 text-right">Safeguard Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {subscriptions.map((sub) => {
                const linkedCard = cards.find((c) => c.id === sub.cardId);
                const isCardFrozen = linkedCard?.isLocked;

                return (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs font-mono">
                          {sub.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{sub.name}</div>
                          <div className="text-[10px] text-slate-400">{sub.category}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <Badge variant="default" size="xs">
                        {sub.frequency}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{sub.nextChargeDate}</div>
                      <span className="text-[10px] text-amber-400 font-bold block">
                        Due in {sub.daysRemaining} days
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-300">{sub.cardName}</span>
                        {isCardFrozen && (
                          <Badge variant="rose" size="xs">
                            Frozen
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="font-bold text-white text-xs">
                        ${parseFloat(sub.monthlyCost || 0).toFixed(2)}/mo
                      </div>
                      <span className="text-[10px] text-slate-400">
                        ${parseFloat(sub.annualCost || 0).toFixed(2)}/yr
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onFreezeCard(sub.cardId)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border flex items-center gap-1 ${
                            isCardFrozen
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/60'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/60'
                          }`}
                          title={isCardFrozen ? 'Unfreeze linked card' : 'Freeze linked card to prevent billing'}
                        >
                          {isCardFrozen ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span>{isCardFrozen ? 'Unfreeze' : 'Freeze Card'}</span>
                        </button>

                        <button
                          onClick={() => onFilterMerchantHistory(sub.name)}
                          className="px-2.5 py-1.5 rounded-xl font-bold text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                          title="View all historical transactions for this merchant"
                        >
                          Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
