import { 
  Receipt, Shield, MapPin, CreditCard, Download, AlertTriangle, CheckCircle 
} from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';

export default function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  onDispute,
  onFreezeCard,
}) {
  if (!transaction) return null;

  const isCredit = transaction.type === 'credit';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Record"
      subtitle={`Authorization Reference #${transaction.authCode || transaction.id}`}
      icon={Receipt}
      maxWidth="max-w-md"
    >
      <div className="space-y-6 text-xs text-slate-200">
        {/* Merchant & Amount Hero */}
        <div className="text-center py-5 bg-slate-950 rounded-2xl border border-[#262B33]">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            {transaction.category}
          </div>
          <div className="text-xl font-bold text-white mb-1 tracking-tight">{transaction.merchant}</div>
          <div className={`text-3xl font-mono font-extrabold ${isCredit ? 'text-emerald-400' : 'text-white'}`}>
            {isCredit ? `+${formatCurrency(transaction.amount)}` : `-${formatCurrency(transaction.amount)}`}
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <Badge variant={transaction.status === 'declined' ? 'rose' : isCredit ? 'emerald' : 'indigo'} size="xs">
              <CheckCircle className="w-3 h-3" />
              <span>{transaction.status}</span>
            </Badge>
            <span className="text-[11px] text-slate-400 font-mono">{transaction.date}</span>
          </div>
        </div>

        {/* Ledger Breakdown Details */}
        <div className="space-y-2.5 p-4 bg-slate-950/70 rounded-2xl border border-[#262B33] text-slate-300">
          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400">Card Used</span>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              <span>{transaction.cardName || 'Primary Executive Card'}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400">Channel / Method</span>
            <span className="font-semibold text-white">{transaction.channel || 'Online Checkout'}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400">Terminal Location</span>
            <div className="flex items-center gap-1 font-semibold text-white">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{transaction.location || 'Online Merchant Gateway'}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800">
            <span className="text-slate-400">Merchant Category Code</span>
            <span className="font-mono text-slate-300">{transaction.mcc || '5734 - Software'}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">Interchange / Processing Fee</span>
            <span className="font-semibold text-emerald-400 font-mono">$0.00 (Waived)</span>
          </div>
        </div>

        {/* Notes */}
        {transaction.notes && (
          <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-xl text-indigo-200">
            <span className="font-bold block mb-0.5 text-[10px] uppercase tracking-wider text-indigo-400 font-mono">Metadata Memo</span>
            <p className="text-[11px] leading-relaxed">{transaction.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                window.print();
              }}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 border border-[#262B33] text-slate-300 font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export Receipt</span>
            </button>

            {transaction.cardId && (
              <button
                onClick={() => onFreezeCard(transaction.cardId)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-rose-950/60 border border-[#262B33] hover:border-rose-800 text-slate-300 hover:text-rose-300 font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Freeze This Card</span>
              </button>
            )}
          </div>

          <button
            onClick={() => onDispute(transaction)}
            className="w-full py-2.5 text-slate-400 hover:text-rose-400 transition font-medium flex items-center justify-center gap-1.5 text-[11px]"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Dispute or Report Suspicious Activity</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
