import { useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';

export default function TopUpModal({ isOpen, onClose, onTopUpSuccess }) {
  const [amount, setAmount] = useState('100');
  const [channel, setChannel] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onTopUpSuccess(parsedAmount, channel);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Top Up Virtual Balance"
      subtitle="Fund your unified CardHub wallet with instant authorization and 0% deposit fees."
      icon={Plus}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#F5F5F7]">
        <div>
          <label className="block font-medium text-[#8E8E93] mb-1 font-mono uppercase text-[11px]">Select Deposit Amount ($)</label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {['50', '100', '250', '500'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`py-1.5 rounded-[8px] font-medium border transition duration-100 ${
                  amount === val
                    ? 'bg-[#0A84FF] text-white border-[#0A84FF] shadow-sm'
                    : 'bg-[#2C2C2E] text-[#8E8E93] border-[#38383A] hover:text-[#F5F5F7]'
                }`}
              >
                ${val}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-[#8E8E93]">$</span>
            <input
              type="number"
              min="10"
              max="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF] font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-[#8E8E93] mb-1 font-mono uppercase text-[11px]">Payment Channel</label>
          <Select
            value={channel}
            onChange={setChannel}
            options={[
              { value: 'card', label: 'Primary Bank Debit Card (Instant)' },
              { value: 'paypal', label: 'PayPal Express Checkout' },
              { value: 'crypto', label: 'Crypto Gateway (USDT TRC20 / BTC)' },
              { value: 'wire', label: 'Direct Bank Wire Transfer' },
            ]}
          />
        </div>

        <div className="p-3 bg-[#0A84FF]/10 text-[#0A84FF] rounded-[8px] text-[11px] leading-relaxed border border-[#0A84FF]/20">
          <div className="flex items-center gap-1.5 font-medium mb-0.5">
            <Shield className="w-3.5 h-3.5 text-[#0A84FF]" />
            <span>Guaranteed Instant Liquidity</span>
          </div>
          <span className="text-[#8E8E93]">Deposited funds are immediately available for card authorizations with 0% interchange markups.</span>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-2.5 bg-[#0A84FF] hover:bg-[#0077ED] text-white font-medium rounded-[8px] shadow-sm transition duration-100 active:scale-[0.98] flex justify-center items-center gap-2 text-xs disabled:opacity-40"
        >
          {isProcessing ? (
            <>
              <div className="w-3.5 h-3.5 border-[1.5px] border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Deposit Authorization...</span>
            </>
          ) : (
            <>Confirm ${parseFloat(amount || 0).toFixed(2)} Deposit</>
          )}
        </button>
      </form>
    </Modal>
  );
}
