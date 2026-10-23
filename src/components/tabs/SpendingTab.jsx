import { 
  TrendingDown, Sparkles, CreditCard 
} from 'lucide-react';
import { SkeletonMetric, SkeletonTable } from '../ui/Skeleton';
import { formatCurrency } from '../../utils/formatters';

export default function SpendingTab({ transactions = [], isLoading = false }) {
  const debits = transactions.filter((t) => t.type === 'debit' && t.status !== 'declined');
  const totalDebitSpend = debits.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  // Group by category
  const categoryMap = {};
  debits.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + (parseFloat(t.amount) || 0);
  });

  const categoryEntries = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalDebitSpend > 0 ? Math.round((amount / totalDebitSpend) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Group by merchant
  const merchantMap = {};
  debits.forEach((t) => {
    if (!merchantMap[t.merchant]) {
      merchantMap[t.merchant] = { name: t.merchant, amount: 0, count: 0, category: t.category };
    }
    merchantMap[t.merchant].amount += (parseFloat(t.amount) || 0);
    merchantMap[t.merchant].count += 1;
  });

  const topMerchants = Object.values(merchantMap)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Group by card
  const cardSpendMap = {};
  debits.forEach((t) => {
    const cardName = t.cardName || 'Primary Executive Card';
    cardSpendMap[cardName] = (cardSpendMap[cardName] || 0) + (parseFloat(t.amount) || 0);
  });

  const cardSpendEntries = Object.entries(cardSpendMap)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalDebitSpend > 0 ? Math.round((amount / totalDebitSpend) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const avgTxSize = debits.length > 0 ? totalDebitSpend / debits.length : 0;
  const maxTx = debits.reduce((max, t) => ((parseFloat(t.amount) || 0) > max.amount ? { amount: parseFloat(t.amount), merchant: t.merchant } : max), { amount: 0, merchant: 'None' });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SkeletonTable rows={4} />
          <SkeletonTable rows={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm">
          <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider block font-mono">
            Net Outflow This Period
          </span>
          <div className="text-2xl font-semibold text-[#F5F5F7] font-mono mt-1 tabular-nums">
            {formatCurrency(totalDebitSpend)}
          </div>
          <span className="text-[10px] text-[#34C759] font-medium flex items-center gap-1 mt-1 font-mono">
            <TrendingDown className="w-3.5 h-3.5" /> 6.4% below monthly target
          </span>
        </div>

        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm">
          <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider block font-mono">
            Average Transaction Size
          </span>
          <div className="text-2xl font-semibold text-[#F5F5F7] font-mono mt-1 tabular-nums">
            {formatCurrency(avgTxSize)}
          </div>
          <span className="text-[10px] text-[#8E8E93]">Across {debits.length} authorized charges</span>
        </div>

        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm">
          <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider block font-mono">
            Peak Single Outflow
          </span>
          <div className="text-2xl font-semibold text-[#F5F5F7] font-mono mt-1 tabular-nums">
            {formatCurrency(maxTx.amount)}
          </div>
          <span className="text-[10px] text-[#8E8E93] truncate block font-mono">
            Authorized by {maxTx.merchant}
          </span>
        </div>

        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm">
          <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider block font-mono">
            Active Payee Count
          </span>
          <div className="text-2xl font-semibold text-[#F5F5F7] font-mono mt-1 tabular-nums">
            {Object.keys(merchantMap).length}
          </div>
          <span className="text-[10px] text-[#0A84FF] font-medium">Unique payees this month</span>
        </div>
      </div>

      {/* 2. Intelligent Insight Notice */}
      <div className="bg-[#1C1C1E] text-[#F5F5F7] p-4 rounded-[12px] border border-[#38383A] flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-[8px] bg-[#0A84FF]/10 border border-[#0A84FF]/20 text-[#0A84FF] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 text-xs">
          <div className="font-semibold text-sm text-[#F5F5F7]">Autonomous Exposure Analysis</div>
          <p className="text-[#8E8E93] leading-relaxed text-[11px]">
            SaaS &amp; Infrastructure accounts for <strong>{categoryEntries[0]?.percentage || 0}%</strong> of total digital payments.
            Isolating these charges on dedicated virtual cards prevents unauthorized renewal spikes and isolates rogue merchant exposure.
          </p>
        </div>
      </div>

      {/* 3. Deep Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Category Breakdown */}
        <div className="lg:col-span-6 bg-[#1C1C1E] p-5 rounded-[12px] border border-[#38383A] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#38383A]">
            <div>
              <h3 className="text-sm font-semibold text-[#F5F5F7] tracking-tight">Category Breakdown</h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">Where your funds were routed this billing cycle</p>
            </div>
            <span className="text-xs font-mono font-medium text-[#8E8E93]">
              {categoryEntries.length} Categories
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {categoryEntries.map((cat, idx) => {
              const colors = [
                'bg-[#0A84FF]',
                'bg-[#34C759]',
                'bg-[#FF9F0A]',
                'bg-[#BF5AF2]',
                'bg-[#64D2FF]',
                'bg-[#FF453A]',
              ];
              const barColor = colors[idx % colors.length];

              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#F5F5F7]">{cat.category}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-[#F5F5F7] tabular-nums">{formatCurrency(cat.amount)}</span>
                      <span className="text-[#8E8E93] text-[11px]">({cat.percentage}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-[#2C2C2E] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${barColor}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Merchants Leaderboard */}
        <div className="lg:col-span-6 bg-[#1C1C1E] p-5 rounded-[12px] border border-[#38383A] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#38383A]">
            <div>
              <h3 className="text-sm font-semibold text-[#F5F5F7] tracking-tight">Top Payees by Volume</h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">Highest cumulative settlement amounts</p>
            </div>
            <span className="text-xs font-mono font-medium text-[#8E8E93]">Top 5</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {topMerchants.map((merchant, index) => (
              <div
                key={merchant.name}
                className="p-3 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[6px] bg-[#1C1C1E] border border-[#38383A] text-[#8E8E93] font-medium text-xs flex items-center justify-center font-mono">
                    #{index + 1}
                  </span>
                  <div>
                    <span className="font-medium text-[#F5F5F7] text-xs block">{merchant.name}</span>
                    <span className="text-[11px] text-[#8E8E93]">
                      {merchant.category} • {merchant.count} {merchant.count === 1 ? 'charge' : 'charges'}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-semibold text-[#F5F5F7] text-sm tabular-nums">
                    {formatCurrency(merchant.amount)}
                  </div>
                  <span className="text-[10px] text-[#8E8E93]">
                    {totalDebitSpend > 0 ? Math.round((merchant.amount / totalDebitSpend) * 100) : 0}% of outflow
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Card-Level Spend Allocation */}
      <div className="bg-[#1C1C1E] p-5 rounded-[12px] border border-[#38383A] space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F5F7] tracking-tight">Card-Level Capital Allocation</h3>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Distribution of spending across individual isolated virtual cards
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {cardSpendEntries.map((cs) => (
            <div
              key={cs.name}
              className="p-3.5 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0A84FF] shrink-0" />
                <span className="font-medium text-[#F5F5F7] truncate">{cs.name}</span>
              </div>

              <div>
                <div className="text-base font-semibold font-mono text-[#F5F5F7] tabular-nums">
                  {formatCurrency(cs.amount)}
                </div>
                <div className="text-[11px] text-[#8E8E93] font-mono">
                  {cs.percentage}% of total spend
                </div>
              </div>

              <div className="w-full bg-[#1C1C1E] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#0A84FF] h-1.5 rounded-full"
                  style={{ width: `${cs.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
