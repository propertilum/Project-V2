import { useState } from 'react';
import { CreditCard, Shield, Sparkles, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { generateCardDetails } from '../../utils/cardGenerator';

export default function FirstTimeCardSetup({ user, onCompleteSetup, onSkipSetup }) {
  const [brand, setBrand] = useState('VISA');
  const [initialDetails] = useState(() => generateCardDetails('VISA'));
  
  const [form, setForm] = useState({
    label: 'Primary Digital Vault Card',
    cardHolderName: (user?.name || 'CARDHOLDER NAME').toUpperCase(),
    cardNumber: initialDetails.cardNumber,
    expDate: initialDetails.expDate,
    cvv: initialDetails.cvv,
    monthlyLimit: 2500,
    perTxLimit: 1000,
    theme: 'midnight',
    billingZip: user?.zipCode || '10001',
    allowOnline: true,
    allowInternational: true,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegenerateDigits = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const details = generateCardDetails(brand);
      setForm((prev) => ({
        ...prev,
        cardNumber: details.cardNumber,
        expDate: details.expDate,
        cvv: details.cvv,
      }));
      setIsGenerating(false);
    }, 250);
  };

  const handleBrandChange = (newBrand) => {
    setBrand(newBrand);
    const details = generateCardDetails(newBrand);
    setForm((prev) => ({
      ...prev,
      cardNumber: details.cardNumber,
      expDate: details.expDate,
      cvv: details.cvv,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      try {
        const cleanDigits = (form.cardNumber || '').replace(/\s+/g, '');
        const last4 = cleanDigits.slice(-4) || '1234';
        const maskedNumber = `•••• •••• •••• ${last4}`;

        const rawName = (user?.name || form.cardHolderName || 'Card Holder').trim();
        const nameParts = rawName.split(/\s+/);
        const firstName = nameParts[0] || 'Card';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Holder';

        const newCard = {
          id: `card-${Date.now()}`,
          label: form.label.trim() || 'Primary Virtual Card',
          type: 'main',
          brand: brand,
          theme: form.theme || 'midnight',
          texture: 'waves',
          isLocked: false,
          isDefault: true,
          monthlyLimit: parseFloat(form.monthlyLimit) || 2500,
          currentSpend: 0.00,
          perTxLimit: parseFloat(form.perTxLimit) || 1000,
          allowOnline: form.allowOnline,
          allowATM: false,
          allowInternational: form.allowInternational,
          firstName: firstName,
          lastName: lastName,
          currentAddress: user?.address || 'CardHub User Residence',
          cityState: user?.cityState || 'Global',
          zipCode: form.billingZip || '10001',
          phoneNumber: user?.phone || '+1 555 000 0000',
          cardNumber: form.cardNumber,
          maskedNumber: maskedNumber,
          last4: last4,
          cvv: form.cvv,
          expDate: form.expDate,
          cardHolderName: form.cardHolderName.trim() || rawName.toUpperCase(),
          createdAt: Date.now(),
        };

        if (onCompleteSetup) {
          onCompleteSetup(newCard);
        }
      } catch (err) {
        console.error('[CardHub] Setup submission error:', err);
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 my-6">
        
        {/* Header Bar */}
        <div className="border-b border-slate-800 px-6 sm:px-8 py-5 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>First-Time Card Setup & Onboarding</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Step 1 of 1
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Welcome, <span className="text-indigo-400 font-semibold">{user?.name || 'Customer'}</span>! Configure your primary virtual spending card.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>PCI-DSS Tokenized</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Live Card Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Live Card Preview
              </span>

              {/* Physical Card Mockup */}
              <div className="w-full aspect-[1.586/1] rounded-2xl p-5 relative overflow-hidden text-white shadow-2xl flex flex-col justify-between border border-white/10 transition-all duration-300 bg-gradient-to-tr from-slate-950 via-indigo-950 to-indigo-900">
                {/* Visual Glass highlights */}
                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/10 rounded-full blur-xl pointer-events-none"></div>

                {/* Top Row: Chip & Brand */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    {/* Simulated EMV Gold Chip */}
                    <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/60 shadow-sm flex items-center justify-center relative overflow-hidden">
                      <div className="w-full h-[1px] bg-amber-700/40 absolute top-2.5"></div>
                      <div className="w-full h-[1px] bg-amber-700/40 absolute bottom-2.5"></div>
                      <div className="h-full w-[1px] bg-amber-700/40 absolute left-3.5"></div>
                    </div>
                    {/* Contactless waves */}
                    <div className="opacity-70 text-slate-300">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                        <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                        <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                      </svg>
                    </div>
                  </div>

                  <span className="font-black italic text-lg tracking-wider">
                    {brand}
                  </span>
                </div>

                {/* Middle: Formatted Card Number */}
                <div className="z-10 my-auto">
                  <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-shadow drop-shadow-sm">
                    {form.cardNumber || '•••• •••• •••• ••••'}
                  </div>
                </div>

                {/* Bottom Row: Holder Name & Expiry */}
                <div className="flex items-end justify-between z-10 text-[11px] font-mono tracking-wider">
                  <div>
                    <div className="text-[8px] uppercase text-indigo-300 font-sans font-bold tracking-widest">
                      Cardholder
                    </div>
                    <div className="font-bold text-slate-100 uppercase truncate max-w-[160px]">
                      {form.cardHolderName || 'CARDHOLDER NAME'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[8px] uppercase text-indigo-300 font-sans font-bold tracking-widest text-right">
                      Expires
                    </div>
                    <div className="font-bold text-slate-100">
                      {form.expDate || '12/28'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Specs Summary */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Card Label:</span>
                  <span className="font-semibold text-white">{form.label || 'Default'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Spend Cap:</span>
                  <span className="font-mono font-bold text-indigo-400">${form.monthlyLimit.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Card State:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready for Issuance
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-[11px] text-slate-400 leading-relaxed">
              <span className="font-bold text-indigo-300 block mb-0.5">Automated Admin Sync:</span>
              Once activated, this card profile and customer metadata will be registered in your account vault and synchronized with the platform ledger.
            </div>
          </div>

          {/* Right Column: Setup Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Network Brand Choice */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Card Payment Network</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleBrandChange('VISA')}
                    className={`py-2.5 px-4 rounded-xl border flex items-center justify-between transition ${
                      brand === 'VISA'
                        ? 'border-indigo-500 bg-indigo-950/40 text-white font-bold'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>VISA Network</span>
                    <span className="px-2 py-0.5 bg-blue-600 text-white font-black italic rounded text-[10px]">VISA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBrandChange('Mastercard')}
                    className={`py-2.5 px-4 rounded-xl border flex items-center justify-between transition ${
                      brand === 'Mastercard'
                        ? 'border-indigo-500 bg-indigo-950/40 text-white font-bold'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>Mastercard Network</span>
                    <span className="px-2 py-0.5 bg-red-600 text-white font-bold rounded text-[10px]">MC</span>
                  </button>
                </div>
              </div>

              {/* Card Label & Cardholder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Card Friendly Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Primary Digital Vault Card"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cardholder Name (Printed)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JOHN DOE"
                    value={form.cardHolderName}
                    onChange={(e) => setForm({ ...form, cardHolderName: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
                  />
                </div>
              </div>

              {/* Card Number & Generation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-300">Generated Virtual Account Number (PAN)</label>
                  <button
                    type="button"
                    onClick={handleRegenerateDigits}
                    disabled={isGenerating}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Generate New Number</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <CreditCard className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Expiry, CVV & Billing Zip */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    placeholder="12/28"
                    value={form.expDate}
                    onChange={(e) => setForm({ ...form, expDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Security CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="•••"
                    value={form.cvv}
                    onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Billing Postal / Zip</label>
                  <input
                    type="text"
                    placeholder="10001"
                    value={form.billingZip}
                    onChange={(e) => setForm({ ...form, billingZip: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Spending Limit Presets */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Monthly Spend Cap ($ USD)</span>
                  <span className="font-mono text-indigo-400 font-bold">${Number(form.monthlyLimit).toLocaleString()}</span>
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[500, 1000, 2500, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm({ ...form, monthlyLimit: val })}
                      className={`py-1.5 rounded-lg border text-xs font-semibold font-mono transition ${
                        Number(form.monthlyLimit) === val
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      ${val.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={form.monthlyLimit}
                  onChange={(e) => setForm({ ...form, monthlyLimit: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-70 text-xs"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Activating Your Virtual Vault...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup & Launch CardHub</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {onSkipSetup && (
                  <button
                    type="button"
                    onClick={onSkipSetup}
                    disabled={loading}
                    className="w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition text-center"
                  >
                    Skip setup & go straight to dashboard →
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
