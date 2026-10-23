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
      <div className="space-y-5 text-xs text-[#F5F5F7]">
        {/* Merchant & Amount Hero */}
        <div className="text-center py-4 bg-[#2C2C2E]/60 rounded-[10px] border border-[#38383A]">
          <div className="text-[10px] uppercase font-semibold text-[#8E8E93] tracking-wider mb-1 font-mono">
            {transaction.category}
          </div>
          <div className="text-xl font-bold text-[#F5F5F7] mb-1 tracking-tight">{transaction.merchant}</div>
          <div className={`text-2xl font-mono font-semibold tabular-nums ${isCredit ? 'text-[#34C759]' : 'text-[#F5F5F7]'}`}>
            {isCredit ? `+${formatCurrency(transaction.amount)}` : `-${formatCurrency(transaction.amount)}`}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Badge variant={transaction.status === 'declined' ? 'red' : isCredit ? 'green' : 'blue'} size="xs">
              <CheckCircle className="w-3 h-3" />
              <span>{transaction.status}</span>
            </Badge>
            <span className="text-[11px] text-[#8E8E93] font-mono">{transaction.date}</span>
          </div>
        </div>

        {/* Ledger Breakdown Details */}
        <div className="space-y-2 p-3.5 bg-[#2C2C2E]/60 rounded-[10px] border border-[#38383A] text-[#F5F5F7]">
          <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
            <span className="text-[#8E8E93]">Card Used</span>
            <div className="flex items-center gap-1.5 font-medium text-[#F5F5F7]">
              <CreditCard className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span>{transaction.cardName || 'Primary Executive Card'}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
            <span className="text-[#8E8E93]">Channel / Method</span>
            <span className="font-medium text-[#F5F5F7]">{transaction.channel || 'Online Checkout'}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
            <span className="text-[#8E8E93]">Terminal Location</span>
            <div className="flex items-center gap-1 font-medium text-[#F5F5F7]">
              <MapPin className="w-3.5 h-3.5 text-[#8E8E93]" />
              <span>{transaction.location || 'Online Merchant Gateway'}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
            <span className="text-[#8E8E93]">Merchant Category Code</span>
            <span className="font-mono text-[#F5F5F7]">{transaction.mcc || '5734 - Software'}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-[#8E8E93]">Interchange / Processing Fee</span>
            <span className="font-medium text-[#34C759] font-mono">$0.00 (Waived)</span>
          </div>
        </div>

        {/* Notes */}
        {transaction.notes && (
          <div className="p-3 bg-[#0A84FF]/10 border border-[#0A84FF]/20 rounded-[8px] text-[#0A84FF]">
            <span className="font-semibold block mb-0.5 text-[10px] uppercase tracking-wider font-mono">Metadata Memo</span>
            <p className="text-[11px] leading-relaxed text-[#F5F5F7]">{transaction.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            <button
              onClick={() => {
                window.print();
              }}
              className="flex-1 py-2 bg-[#2C2C2E] hover:bg-[#38383A] border border-[#38383A] text-[#F5F5F7] font-medium rounded-[8px] transition duration-100 active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span>Export Receipt</span>
            </button>

            {transaction.cardId && (
              <button
                onClick={() => onFreezeCard(transaction.cardId)}
                className="flex-1 py-2 bg-[#2C2C2E] hover:bg-[#FF453A]/20 border border-[#38383A] hover:border-[#FF453A]/40 text-[#FF453A] font-medium rounded-[8px] transition duration-100 active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#FF453A]" />
                <span>Freeze Card</span>
              </button>
            )}
          </div>

          <button
            onClick={() => onDispute(transaction)}
            className="w-full py-2 text-[#8E8E93] hover:text-[#FF453A] transition font-medium flex items-center justify-center gap-1.5 text-[11px]"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Dispute or Report Suspicious Activity</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
