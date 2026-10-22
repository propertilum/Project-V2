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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-3xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
        {/* Header */}
        <div className="border-b border-slate-800 px-8 py-5 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-base">CardHub Account Lifetime Activation</span>
          </div>
          <span className="text-[11px] font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> $25.00 One-time Activation
          </span>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-800/50 rounded-2xl p-5 flex items-start gap-4 shadow-inner">
              <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider">Account Access Fee</div>
                <div className="text-3xl font-extrabold text-white mt-0.5 font-mono">
                  $25.00 <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  One-time lifetime payment to activate your cryptographic card issuance engine and access virtual spending controls.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Select Payment Channel
              </label>
              <div className="space-y-2.5 text-xs">
                <label
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                    method === 'card' ? 'border-indigo-500 bg-indigo-950/30' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={method === 'card'}
                      onChange={() => setMethod('card')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-200">Credit / Debit Card</span>
                  </div>
                  <div className="flex space-x-1">
                    <span className="px-2 py-0.5 bg-blue-600 text-white font-black rounded italic text-[10px]">VISA</span>
                    <span className="px-2 py-0.5 bg-red-500 text-white font-bold rounded text-[10px]">MC</span>
                  </div>
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                    method === 'paypal' ? 'border-indigo-500 bg-indigo-950/30' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={method === 'paypal'}
                      onChange={() => setMethod('paypal')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-200">PayPal Express Checkout</span>
                  </div>
                  <span className="text-blue-400 font-black italic text-xs">PayPal</span>
                </label>
              </div>
            </div>

            {success ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Payment Verified! Opening Command Center...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-70 text-xs"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                    className="w-full text-center text-[11px] text-slate-500 hover:text-slate-300 py-1 transition"
                  >
                    Skip &amp; Continue with Demo Mode
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Summary */}
          <div className="md:col-span-2 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between text-xs space-y-4">
            <div>
              <span className="font-bold text-slate-200 text-xs block mb-3 uppercase tracking-wider text-indigo-400">
                Included Features
              </span>
              <ul className="space-y-2.5 text-slate-300 text-[11px]">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Unlimited Virtual Card Creation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Instant Disposable Burner Engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Recurring Subscription Protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Pre-Funded $250.00 Wallet Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Exportable PDF Financial Statements</span>
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-indigo-400" />
              <span>Encrypted via 256-Bit SSL Gateway</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
