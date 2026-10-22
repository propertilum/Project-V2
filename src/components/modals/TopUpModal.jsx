import { useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import Modal from '../ui/Modal';

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
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200">
        <div>
          <label className="block font-bold text-slate-200 mb-1.5">Select Deposit Amount ($)</label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {['50', '100', '250', '500'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`py-2 rounded-xl font-bold border transition ${
                  amount === val
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-300 border-[#262B33] hover:text-white'
                }`}
              >
                ${val}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
            <input
              type="number"
              min="10"
              max="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-[#262B33] rounded-xl font-bold text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-200 mb-1.5">Payment Channel</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full p-2.5 bg-slate-950 border border-[#262B33] rounded-xl font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="card">Primary Bank Debit Card (Instant)</option>
            <option value="paypal">PayPal Express Checkout</option>
            <option value="crypto">Crypto Gateway (USDT TRC20 / BTC)</option>
            <option value="wire">Direct Bank Wire Transfer</option>
          </select>
        </div>

        <div className="p-3 bg-indigo-950/30 text-indigo-200 rounded-xl text-[11px] leading-relaxed border border-indigo-900/40">
          <div className="flex items-center gap-1.5 font-bold mb-0.5 text-indigo-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Guaranteed Instant Liquidity</span>
          </div>
          Deposited funds are immediately available for card authorizations with 0% interchange markups.
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition flex justify-center items-center gap-2 text-xs disabled:opacity-60"
        >
          {isProcessing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
