import { 
  TrendingDown, Sparkles, CreditCard 
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function SpendingTab({ transactions = [] }) {
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

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Net Outflow This Period
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(totalDebitSpend)}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1 font-mono">
            <TrendingDown className="w-3.5 h-3.5" /> 6.4% below monthly target
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Average Transaction Size
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(avgTxSize)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Across {debits.length} authorized charges</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Peak Single Outflow
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(maxTx.amount)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium truncate block font-mono">
            Authorized by {maxTx.merchant}
          </span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Payee Count
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {Object.keys(merchantMap).length}
          </div>
          <span className="text-[10px] text-indigo-400 font-bold">Unique payees this month</span>
        </div>
      </div>

      {/* 2. Intelligent Insight Notice */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-sm text-white">Autonomous Exposure Analysis</div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            SaaS &amp; Infrastructure accounts for <strong>{categoryEntries[0]?.percentage || 0}%</strong> of total digital payments.
            Isolating these charges on dedicated virtual cards prevents unauthorized renewal spikes and isolates rogue merchant exposure.
          </p>
        </div>
      </div>

      {/* 3. Deep Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Category Breakdown */}
        <div className="lg:col-span-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Category Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Where your funds were routed this billing cycle</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              {categoryEntries.length} Categories
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {categoryEntries.map((cat, idx) => {
              const colors = [
                'bg-indigo-500',
                'bg-sky-500',
                'bg-amber-400',
                'bg-emerald-500',
                'bg-rose-500',
                'bg-purple-500',
              ];
              const barColor = colors[idx % colors.length];

              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-200">{cat.category}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white">{formatCurrency(cat.amount)}</span>
                      <span className="text-slate-400 text-[11px]">({cat.percentage}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
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
        <div className="lg:col-span-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Top Payees by Volume</h3>
              <p className="text-xs text-slate-400 mt-0.5">Highest cumulative settlement amounts</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">Top 5</span>
          </div>

          <div className="space-y-3 text-xs">
            {topMerchants.map((merchant, index) => (
              <div
                key={merchant.name}
                className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center font-mono">
                    #{index + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white text-xs block">{merchant.name}</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {merchant.category} • {merchant.count} {merchant.count === 1 ? 'charge' : 'charges'}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-black text-white text-sm">
                    {formatCurrency(merchant.amount)}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {totalDebitSpend > 0 ? Math.round((merchant.amount / totalDebitSpend) * 100) : 0}% of outflow
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Card-Level Spend Allocation */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Card-Level Capital Allocation</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribution of spending across individual isolated virtual cards
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {cardSpendEntries.map((cs) => (
            <div
              key={cs.name}
              className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-bold text-white truncate">{cs.name}</span>
              </div>

              <div>
                <div className="text-lg font-black font-mono text-white">
                  {formatCurrency(cs.amount)}
                </div>
                <div className="text-[11px] text-slate-400 font-medium font-mono">
                  {cs.percentage}% of total spend
                </div>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full"
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
