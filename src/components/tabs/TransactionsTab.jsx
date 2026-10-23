import { useState, useMemo } from 'react';
import { 
  Search, ArrowUpRight, ArrowDownLeft, Download, X,
  Building2, Layers
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { SkeletonTable } from '../ui/Skeleton';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORIES } from '../../data/constants';

export default function TransactionsTab({
  transactions = [],
  cards = [],
  onSelectTransaction,
  initialFilter = '',
  isLoading = false,
  onFilterCleared,
}) {
  const [search, setSearch] = useState(initialFilter);
  const [prevInitialFilter, setPrevInitialFilter] = useState(initialFilter);
  const [selectedCardId, setSelectedCardId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // React pattern: Adjust state upon prop change without triggering cascading effect renders
  if (initialFilter !== prevInitialFilter) {
    setPrevInitialFilter(initialFilter);
    if (initialFilter) {
      setSearch(initialFilter);
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchMerchant = (t.merchant || '').toLowerCase().includes(q);
          const matchAuth = (t.authCode || '').toLowerCase().includes(q);
          const matchNotes = (t.notes || '').toLowerCase().includes(q);
          if (!matchMerchant && !matchAuth && !matchNotes) return false;
        }

        // Card
        if (selectedCardId !== 'all' && t.cardId !== selectedCardId) return false;

        // Category
        if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;

        // Status
        if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;

        // Type
        if (selectedType !== 'all' && t.type !== selectedType) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0);
        if (sortBy === 'amount-asc') return (a.amount || 0) - (b.amount || 0);
        if (sortBy === 'date-asc') return (a.id > b.id ? 1 : -1);
        return (a.id < b.id ? 1 : -1); // default date-desc
      });
  }, [transactions, search, selectedCardId, selectedCategory, selectedStatus, selectedType, sortBy]);

  const totalDebits = filteredTransactions
    .filter((t) => t.type === 'debit' && t.status !== 'declined')
    .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  const totalDeclined = filteredTransactions
    .filter((t) => t.status === 'declined')
    .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Merchant', 'Card', 'Category', 'Status', 'Type', 'Amount'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      `"${t.merchant}"`,
      `"${t.cardName || ''}"`,
      t.category,
      t.status,
      t.type,
      t.amount,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cardhub_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm">
          <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider block font-mono">
            Filtered Outflow Volume
          </span>
          <div className="text-2xl font-semibold text-[#F5F5F7] font-mono mt-1 tabular-nums">
            {formatCurrency(totalDebits)}
          </div>
          <span className="text-[10px] text-[#8E8E93]">Cleared and authorized debits</span>
        </div>

        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm">
          <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider block font-mono">
            Protected / Declined Volume
          </span>
          <div className="text-2xl font-semibold text-[#FF453A] font-mono mt-1 tabular-nums">
            {formatCurrency(totalDeclined)}
          </div>
          <span className="text-[10px] text-[#8E8E93]">Blocked by spending boundaries</span>
        </div>

        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider block font-mono">
              Matched Records
            </span>
            <div className="text-2xl font-semibold text-[#F5F5F7] font-mono mt-1 tabular-nums">
              {filteredTransactions.length}{' '}
              <span className="text-xs font-normal text-[#8E8E93]">/ {transactions.length}</span>
            </div>
            <span className="text-[10px] text-[#8E8E93]">Normalized telemetry events</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* 2. Search & Filtering Controls */}
      <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchant, auth code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value && onFilterCleared) onFilterCleared();
              }}
              className="w-full pl-8 pr-8 py-1.5 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[#F5F5F7] placeholder-[#8E8E93] focus:outline-none focus:border-[#0A84FF] text-xs"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); if (onFilterCleared) onFilterCleared(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#F5F5F7]"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Card Filter */}
          <div>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF]"
            >
              <option value="all">All Cards</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} (··{c.last4 || c.cardNumber?.slice(-4) || '4242'})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF]"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed / Settled</option>
              <option value="declined">Declined / Blocked</option>
              <option value="pending">Pending Auth</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF]"
            >
              <option value="all">All Types</option>
              <option value="debit">Debits</option>
              <option value="credit">Credits</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF]"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Transaction Ledger Table */}
      <div className="bg-[#1C1C1E] rounded-[12px] border border-[#38383A] shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={6} />
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-[10px] bg-[#2C2C2E] text-[#8E8E93] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-[#F5F5F7]">No matching transactions</h4>
            <p className="text-xs text-[#8E8E93] max-w-sm mx-auto">
              No authorizations match the active search and filter parameters.
            </p>
            <Button
              variant="outline"
              size="xs"
              onClick={() => { setSearch(''); setSelectedCardId('all'); setSelectedCategory('All'); setSelectedStatus('all'); }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#38383A] bg-[#2C2C2E]/60 text-[#8E8E93] uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-3 px-5">Merchant / Destination</th>
                  <th className="py-3 px-4">Card Used</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#38383A]/60 font-normal">
                {filteredTransactions.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  const isDeclined = tx.status === 'declined';
                  const matchedCard = cards.find((c) => c.id === tx.cardId);
                  const isBank = matchedCard?.source === 'bank_connection';

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction?.(tx)}
                      className="hover:bg-[#2C2C2E]/60 transition cursor-pointer"
                    >
                      <td className="py-3 px-5 flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-[6px] flex items-center justify-center font-medium shrink-0 ${
                            isDeclined
                              ? 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30'
                              : isCredit
                                ? 'bg-[#34C759]/15 text-[#34C759]'
                                : 'bg-[#2C2C2E] text-[#8E8E93]'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <span className={`font-medium block ${isDeclined ? 'text-[#FF453A]' : 'text-[#F5F5F7]'}`}>
                            {tx.merchant}
                          </span>
                          {tx.authCode && (
                            <span className="text-[10px] text-[#8E8E93] font-mono">
                              Auth: {tx.authCode}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#F5F5F7]">
                        <div className="flex items-center gap-1.5">
                          {isBank ? (
                            <Building2 className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />
                          ) : (
                            <Layers className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                          )}
                          <span>{tx.cardName || 'Primary Card'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#8E8E93]">{tx.category}</td>
                      <td className="py-3 px-4 text-[#636366] font-mono text-[11px]">{tx.date}</td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            isDeclined
                              ? 'red'
                              : tx.status === 'pending'
                                ? 'orange'
                                : 'green'
                          }
                          size="xs"
                        >
                          {tx.status}
                        </Badge>
                      </td>

                      <td
                        className={`py-3 px-5 text-right font-mono font-medium text-sm tabular-nums ${
                          isDeclined
                            ? 'text-[#636366] line-through'
                            : isCredit
                              ? 'text-[#34C759]'
                              : 'text-[#F5F5F7]'
                        }`}
                      >
                        {isCredit
                          ? `+${formatCurrency(tx.amount)}`
                          : `-${formatCurrency(tx.amount)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
