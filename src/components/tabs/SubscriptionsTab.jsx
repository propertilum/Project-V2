import { 
  Shield, CheckCircle, Lock, Unlock, Flame 
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { SkeletonMetric, SkeletonTable } from '../ui/Skeleton';
import { formatCurrency } from '../../utils/formatters';

export default function SubscriptionsTab({
  subscriptions = [],
  cards = [],
  onFreezeCard,
  onOpenBurnerCard,
  onFilterMerchantHistory,
  isLoading = false,
}) {
  const totalMonthly = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, s) => acc + (parseFloat(s.monthlyCost) || 0), 0);

  const totalAnnual = totalMonthly * 12;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm">
          <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider block font-mono">
            Monthly Subscription Outflow
          </span>
          <div className="text-2xl font-semibold text-[#F5F5F7] font-mono mt-1 tabular-nums">
            {formatCurrency(totalMonthly)}
          </div>
          <span className="text-[10px] text-[#8E8E93]">Auto-renewing recurring commitments</span>
        </div>

        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm">
          <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider block font-mono">
            Projected Annual Run-Rate
          </span>
          <div className="text-2xl font-semibold text-[#F5F5F7] font-mono mt-1 tabular-nums">
            {formatCurrency(totalAnnual)}
          </div>
          <span className="text-[10px] text-[#0A84FF] font-medium">12-month recurring projection</span>
        </div>

        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm">
          <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider block font-mono">
            Active Monitored Services
          </span>
          <div className="text-2xl font-semibold text-[#F5F5F7] font-mono mt-1 tabular-nums">
            {subscriptions.length} Services
          </div>
          <span className="text-[10px] text-[#34C759] font-medium flex items-center gap-1 font-mono">
            <CheckCircle className="w-3 h-3" /> Bound to virtual cards
          </span>
        </div>
      </div>

      {/* 2. Intelligence Banner */}
      <div className="bg-[#1C1C1E] border border-[#38383A] rounded-[12px] p-4 flex items-start gap-3 text-[#F5F5F7] text-xs">
        <Shield className="w-5 h-5 text-[#0A84FF] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-sm text-[#F5F5F7]">Recurring Exposure Isolation</span>
          <p className="text-[11px] text-[#8E8E93] mt-0.5 leading-relaxed">
            CardHub detects recurring merchant billing signatures. If an online provider attempts an unannounced price hike or makes subscription cancellation difficult, freezing the card here immediately drops all subsequent authorizations with zero risk to your other cards.
          </p>
        </div>
      </div>

      {/* 3. Subscriptions Detailed Table & Mobile List */}
      <div className="bg-[#1C1C1E] rounded-[12px] border border-[#38383A] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#38383A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#2C2C2E]/60">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F7] tracking-tight">Detected Recurring Charges</h3>
            <p className="text-xs text-[#8E8E93] mt-0.5">Automated detection from merchant billing patterns</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={Flame}
            onClick={onOpenBurnerCard}
            className="self-start sm:self-auto shrink-0"
          >
            Protect Trial with Burner
          </Button>
        </div>

        {/* Mobile View: Native Card List */}
        <div className="md:hidden divide-y divide-[#38383A]/60">
          {subscriptions.map((sub) => {
            const linkedCard = cards.find((c) => c.id === sub.cardId);
            const isCardFrozen = linkedCard?.isLocked;

            return (
              <div key={sub.id} className="p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-[8px] bg-[#2C2C2E] border border-[#38383A] text-[#8E8E93] flex items-center justify-center font-bold text-xs font-mono shrink-0">
                      {sub.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-[#F5F5F7] truncate">{sub.name}</span>
                        <Badge variant="default" size="xs">{sub.frequency}</Badge>
                      </div>
                      <div className="text-[11px] text-[#8E8E93] mt-0.5 truncate font-mono">
                        {sub.cardName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div className="font-semibold text-xs text-[#F5F5F7]">
                      ${parseFloat(sub.monthlyCost || 0).toFixed(2)}/mo
                    </div>
                    <div className="text-[10px] text-[#8E8E93]">
                      ${parseFloat(sub.annualCost || 0).toFixed(2)}/yr
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-[11px] text-[#FF9F0A] font-mono">
                    Due {sub.nextChargeDate} ({sub.daysRemaining}d)
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onFreezeCard(sub.cardId)}
                      className={`px-2.5 py-1 rounded-[6px] font-medium text-xs transition duration-100 active:scale-[0.98] border flex items-center gap-1 ${
                        isCardFrozen
                          ? 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30'
                          : 'bg-[#2C2C2E] text-[#8E8E93] border-[#38383A] hover:text-[#FF453A]'
                      }`}
                    >
                      {isCardFrozen ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{isCardFrozen ? 'Unfreeze' : 'Freeze'}</span>
                    </button>
                    <button
                      onClick={() => onFilterMerchantHistory(sub.name)}
                      className="px-2.5 py-1 rounded-[6px] font-medium text-xs text-[#8E8E93] hover:text-[#F5F5F7] bg-[#2C2C2E] border border-[#38383A]"
                    >
                      Ledger
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Ledger Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead>
              <tr className="border-b border-[#38383A] bg-[#2C2C2E]/40 text-[#8E8E93] uppercase font-mono text-[10px] tracking-wider">
                <th className="py-3 px-5">Service &amp; Provider</th>
                <th className="py-3 px-4">Billing Frequency</th>
                <th className="py-3 px-4">Next Renewal</th>
                <th className="py-3 px-4">Linked Virtual Card</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th className="py-3 px-5 text-right">Safeguard Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38383A]/60 font-normal">
              {subscriptions.map((sub) => {
                const linkedCard = cards.find((c) => c.id === sub.cardId);
                const isCardFrozen = linkedCard?.isLocked;

                return (
                  <tr key={sub.id} className="hover:bg-[#2C2C2E]/60 transition">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-[6px] bg-[#2C2C2E] border border-[#38383A] text-[#8E8E93] flex items-center justify-center font-medium text-xs font-mono">
                          {sub.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[#F5F5F7] text-xs">{sub.name}</div>
                          <div className="text-[10px] text-[#8E8E93]">{sub.category}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#F5F5F7]">
                      <Badge variant="default" size="xs">
                        {sub.frequency}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[#F5F5F7]">{sub.nextChargeDate}</div>
                      <span className="text-[10px] text-[#FF9F0A] font-medium block">
                        Due in {sub.daysRemaining} days
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#8E8E93]">{sub.cardName}</span>
                        {isCardFrozen && (
                          <Badge variant="red" size="xs">
                            Frozen
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <div className="font-medium text-[#F5F5F7] text-xs">
                        ${parseFloat(sub.monthlyCost || 0).toFixed(2)}/mo
                      </div>
                      <span className="text-[10px] text-[#8E8E93]">
                        ${parseFloat(sub.annualCost || 0).toFixed(2)}/yr
                      </span>
                    </td>

                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onFreezeCard(sub.cardId)}
                          className={`min-w-[104px] justify-center px-2.5 py-1.5 rounded-[8px] font-medium text-xs transition duration-100 active:scale-[0.98] border flex items-center gap-1.5 box-border ${
                            isCardFrozen
                              ? 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30 hover:bg-[#34C759]/25'
                              : 'bg-[#2C2C2E] text-[#8E8E93] border-[#38383A] hover:bg-[#FF453A]/20 hover:text-[#FF453A] hover:border-[#FF453A]/40'
                          }`}
                          title={isCardFrozen ? 'Unfreeze linked card' : 'Freeze linked card to prevent billing'}
                        >
                          {isCardFrozen ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span>{isCardFrozen ? 'Unfreeze' : 'Freeze Card'}</span>
                        </button>

                        <button
                          onClick={() => onFilterMerchantHistory(sub.name)}
                          className="px-2.5 py-1.5 rounded-[8px] font-medium text-xs text-[#8E8E93] hover:text-[#F5F5F7] bg-[#2C2C2E] border border-[#38383A] hover:border-[#38383A]/80 transition duration-100 active:scale-[0.98]"
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
