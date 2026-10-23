import { useState } from 'react';
import { CreditCard, Shield, Sparkles, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import CardPreview from '../cards/CardPreview';
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
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center items-center p-4 font-sans text-[#F5F5F7]">
      <div className="w-full max-w-4xl bg-[#1C1C1E] rounded-[16px] overflow-hidden border border-[#38383A] my-6">
        
        {/* Header Bar */}
        <div className="border-b border-[#38383A] px-6 sm:px-8 py-4 bg-[#2C2C2E]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#0A84FF] rounded-[10px] flex items-center justify-center text-white font-semibold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[16px] font-semibold text-white tracking-tight flex items-center gap-2">
                <span>First-Time Card Setup &amp; Onboarding</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30 font-medium">
                  Step 1 of 1
                </span>
              </h1>
              <p className="text-[12px] text-[#8E8E93]">
                Welcome, <span className="text-white font-medium">{user?.name || 'Customer'}</span>! Configure your primary virtual card.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E93]">
            <Shield className="w-3.5 h-3.5 text-[#34C759]" />
            <span>PCI-DSS Tokenized</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Live Card Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider block mb-3 font-mono">
                Live Card Preview
              </span>

              {/* CardHub Virtual Card Preview */}
              <CardPreview
                card={{
                  label: form.label || 'Primary Digital Vault Card',
                  brand: brand,
                  cardNumber: form.cardNumber,
                  cardHolderName: form.cardHolderName || 'Cardholder Name',
                  expDate: form.expDate || '12/28',
                  cvv: form.cvv || '942',
                  monthlyLimit: form.monthlyLimit,
                  currentSpend: 0,
                  theme: form.theme || 'midnight',
                  texture: 'circuit',
                  isLocked: false,
                  source: 'cardhub_issuer',
                }}
                showNumber={true}
                showCVV={true}
              />

              {/* Card Specs Summary */}
              <div className="mt-4 p-4 rounded-[8px] bg-[#2C2C2E] border border-[#38383A] text-[12px] space-y-2">
                <div className="flex justify-between text-[#8E8E93]">
                  <span>Card Label:</span>
                  <span className="font-medium text-[#F5F5F7]">{form.label || 'Default'}</span>
                </div>
                <div className="flex justify-between text-[#8E8E93]">
                  <span>Monthly Spend Cap:</span>
                  <span className="font-mono font-medium text-[#34C759]">${form.monthlyLimit.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-[#8E8E93]">
                  <span>Card State:</span>
                  <span className="text-[#34C759] font-medium flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Ready for Issuance
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[11px] text-[#8E8E93] leading-relaxed">
              <span className="font-medium text-[#0A84FF] block mb-0.5">Automated Vault Sync:</span>
              Once activated, this card profile and customer metadata will be registered in your account vault and synchronized with the platform ledger.
            </div>
          </div>

          {/* Right Column: Setup Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4 text-[12px]">
              
              {/* Network Brand Choice */}
              <div>
                <label className="block font-medium text-[#8E8E93] mb-1.5 text-[11px] uppercase tracking-wider">Card Payment Network</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleBrandChange('VISA')}
                    className={`py-2 px-3 rounded-[8px] border flex items-center justify-between transition active:scale-[0.98] ${
                      brand === 'VISA'
                        ? 'border-[#0A84FF] bg-[#0A84FF]/10 text-white font-medium'
                        : 'border-[#38383A] bg-[#2C2C2E] text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    <span>VISA Network</span>
                    <span className="px-1.5 py-0.5 bg-[#0A84FF]/20 text-[#0A84FF] font-bold rounded text-[10px]">VISA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBrandChange('Mastercard')}
                    className={`py-2 px-3 rounded-[8px] border flex items-center justify-between transition active:scale-[0.98] ${
                      brand === 'Mastercard'
                        ? 'border-[#0A84FF] bg-[#0A84FF]/10 text-white font-medium'
                        : 'border-[#38383A] bg-[#2C2C2E] text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    <span>Mastercard Network</span>
                    <span className="px-1.5 py-0.5 bg-[#FF453A]/20 text-[#FF453A] font-bold rounded text-[10px]">MC</span>
                  </button>
                </div>
              </div>

              {/* Card Label & Cardholder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#8E8E93] mb-1 text-[11px]">Card Friendly Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Primary Digital Vault Card"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[12px] text-white focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] transition"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#8E8E93] mb-1 text-[11px]">Cardholder Name (Printed)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JOHN DOE"
                    value={form.cardHolderName}
                    onChange={(e) => setForm({ ...form, cardHolderName: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[12px] text-white uppercase focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] transition font-mono"
                  />
                </div>
              </div>

              {/* Card Number & Generation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-[#8E8E93] text-[11px]">Generated Account Number (PAN)</label>
                  <button
                    type="button"
                    onClick={handleRegenerateDigits}
                    disabled={isGenerating}
                    className="text-[11px] text-[#0A84FF] hover:underline flex items-center gap-1 font-medium"
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
                    className="w-full pl-3 pr-10 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[12px] text-white font-mono tracking-wider focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] transition"
                  />
                  <CreditCard className="w-4 h-4 text-[#8E8E93] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Expiry, CVV & Billing Zip */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#8E8E93] mb-1 text-[11px]">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    placeholder="12/28"
                    value={form.expDate}
                    onChange={(e) => setForm({ ...form, expDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[12px] text-white font-mono text-center focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] transition"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#8E8E93] mb-1 text-[11px]">Security CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="•••"
                    value={form.cvv}
                    onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[12px] text-white font-mono text-center focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] transition"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#8E8E93] mb-1 text-[11px]">Billing Postal / Zip</label>
                  <input
                    type="text"
                    placeholder="10001"
                    value={form.billingZip}
                    onChange={(e) => setForm({ ...form, billingZip: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[12px] text-white text-center focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] transition"
                  />
                </div>
              </div>

              {/* Spending Limit Presets */}
              <div>
                <label className="block font-medium text-[#8E8E93] mb-1.5 flex items-center justify-between text-[11px]">
                  <span>Monthly Spend Cap ($ USD)</span>
                  <span className="font-mono text-[#34C759] font-medium">${Number(form.monthlyLimit).toLocaleString()}</span>
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[500, 1000, 2500, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm({ ...form, monthlyLimit: val })}
                      className={`py-1 rounded-[6px] border text-[11px] font-medium font-mono transition active:scale-[0.98] ${
                        Number(form.monthlyLimit) === val
                          ? 'border-[#0A84FF] bg-[#0A84FF] text-white'
                          : 'border-[#38383A] bg-[#2C2C2E] text-[#8E8E93] hover:text-white'
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
                  className="w-full accent-[#0A84FF] cursor-pointer"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white font-medium rounded-[8px] flex items-center justify-center gap-2 transition disabled:opacity-50 text-[13px]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Activating Your Virtual Vault...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup &amp; Launch CardHub</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {onSkipSetup && (
                  <button
                    type="button"
                    onClick={onSkipSetup}
                    disabled={loading}
                    className="w-full py-2 bg-transparent hover:bg-[#2C2C2E] text-[#8E8E93] hover:text-white text-[12px] font-medium rounded-[8px] transition text-center"
                  >
                    Skip setup &amp; go straight to dashboard →
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
