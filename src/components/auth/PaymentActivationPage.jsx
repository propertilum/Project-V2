import { useState } from 'react';
import { CreditCard, Shield, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function PaymentActivationPage({ onPaymentComplete, onBypassDemo }) {
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onPaymentComplete();
      }, 1000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center items-center p-4 font-sans text-[#F5F5F7]">
      <div className="w-full max-w-3xl bg-[#1C1C1E] rounded-[16px] overflow-hidden border border-[#38383A]">
        {/* Header */}
        <div className="border-b border-[#38383A] px-8 py-4 flex justify-between items-center bg-[#2C2C2E]/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#0A84FF] rounded-[8px] flex items-center justify-center text-white font-semibold">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-semibold text-white text-[15px]">CardHub Lifetime Activation</span>
          </div>
          <span className="text-[11px] font-medium px-2.5 py-1 bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 rounded-full flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3" /> $25.00 One-time Activation
          </span>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            <div className="bg-[#2C2C2E] border border-[#38383A] rounded-[12px] p-5 flex items-start gap-4">
              <div className="p-2.5 bg-[#0A84FF] text-white rounded-[10px]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#0A84FF] font-medium uppercase tracking-wider">Account Access Fee</div>
                <div className="text-2xl font-bold text-white mt-0.5 font-mono">
                  $25.00 <span className="text-[12px] font-normal text-[#8E8E93]">USD</span>
                </div>
                <p className="text-[12px] text-[#8E8E93] mt-1 leading-relaxed">
                  One-time lifetime payment to activate your cryptographic card issuance engine and access virtual spending controls.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider mb-2.5">
                Select Payment Channel
              </label>
              <div className="space-y-2 text-[12px]">
                <label
                  className={`flex items-center justify-between p-3.5 rounded-[8px] border cursor-pointer transition active:scale-[0.99] ${
                    method === 'card' ? 'border-[#0A84FF] bg-[#0A84FF]/10 text-white' : 'border-[#38383A] bg-[#2C2C2E] hover:border-[#48484A]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={method === 'card'}
                      onChange={() => setMethod('card')}
                      className="text-[#0A84FF] focus:ring-[#0A84FF]"
                    />
                    <span className="font-medium text-[#F5F5F7]">Credit / Debit Card</span>
                  </div>
                  <div className="flex space-x-1.5">
                    <span className="px-1.5 py-0.5 bg-[#0A84FF]/20 text-[#0A84FF] font-bold rounded text-[10px]">VISA</span>
                    <span className="px-1.5 py-0.5 bg-[#FF453A]/20 text-[#FF453A] font-bold rounded text-[10px]">MC</span>
                  </div>
                </label>

                <label
                  className={`flex items-center justify-between p-3.5 rounded-[8px] border cursor-pointer transition active:scale-[0.99] ${
                    method === 'paypal' ? 'border-[#0A84FF] bg-[#0A84FF]/10 text-white' : 'border-[#38383A] bg-[#2C2C2E] hover:border-[#48484A]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={method === 'paypal'}
                      onChange={() => setMethod('paypal')}
                      className="text-[#0A84FF] focus:ring-[#0A84FF]"
                    />
                    <span className="font-medium text-[#F5F5F7]">PayPal Express Checkout</span>
                  </div>
                  <span className="text-[#0A84FF] font-bold text-[12px]">PayPal</span>
                </label>
              </div>
            </div>

            {success ? (
              <div className="p-3.5 bg-[#34C759]/15 border border-[#34C759]/30 text-[#34C759] rounded-[8px] text-center text-[12px] font-medium flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#34C759]" />
                <span>Payment Verified! Opening Command Center...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="w-full py-2.5 bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white font-medium rounded-[8px] flex items-center justify-center gap-2 transition disabled:opacity-50 text-[13px]"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authorizing $25.00 Activation...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Activation ($25.00 USD)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {onBypassDemo && (
                  <button
                    type="button"
                    onClick={onBypassDemo}
                    className="w-full text-center text-[11px] text-[#8E8E93] hover:text-[#F5F5F7] py-1 transition"
                  >
                    Skip &amp; Continue with Demo Mode
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Summary */}
          <div className="md:col-span-2 bg-[#2C2C2E] p-5 rounded-[12px] border border-[#38383A] flex flex-col justify-between text-[12px] space-y-4">
            <div>
              <span className="font-semibold text-white text-[12px] block mb-3 uppercase tracking-wider">
                Included Features
              </span>
              <ul className="space-y-2.5 text-[#8E8E93] text-[12px]">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                  <span>Unlimited Virtual Card Creation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                  <span>Instant Disposable Burner Engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                  <span>Recurring Subscription Protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                  <span>Pre-Funded $250.00 Wallet Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                  <span>Exportable PDF Financial Statements</span>
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-[#38383A] text-[11px] text-[#8E8E93] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#34C759]" />
              <span>Encrypted via 256-Bit SSL Gateway</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
