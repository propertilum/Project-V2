import { useState } from 'react';
import { 
  Sparkles, Copy, Eye, EyeOff, Lock 
} from 'lucide-react';
import CardPreview from '../cards/CardPreview';
import { CARD_THEMES } from '../../data/constants';

export default function CardStudioTab({
  activeCard,
  onUpdateActiveCard,
  onCopy,
}) {
  const [showSensitive, setShowSensitive] = useState(false);
  const [showCVV, setShowCVV] = useState(false);

  if (!activeCard) return null;

  return (
    <div className="bg-[#1C1C1E] rounded-[12px] border border-[#38383A] p-6 md:p-8 space-y-8 text-[#F5F5F7]">
      {/* Studio Header */}
      <div className="border-b border-[#38383A] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold text-[#F5F5F7] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0A84FF]" />
            <span>Card Studio Customizer</span>
          </h2>
          <p className="text-[12px] text-[#8E8E93] mt-0.5">
            Calibrate visual physical card simulations, network branding, and client billing records.
          </p>
        </div>

        <span className="text-[11px] font-mono font-medium text-[#0A84FF] bg-[#0A84FF]/15 px-3 py-1.5 rounded-full border border-[#0A84FF]/30 w-fit">
          Editing: {activeCard.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Sticky Card Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-sm space-y-4">
            <span className="block text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider font-mono text-center">
              Real-Time Card Canvas
            </span>

            <CardPreview
              card={activeCard}
              showNumber={showSensitive}
              showCVV={showCVV}
            />

            <div className="grid grid-cols-3 gap-2 text-[12px]">
              <button
                onClick={() => onCopy(activeCard.cardNumber, 'Card Number')}
                className="py-2 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] text-[#F5F5F7] font-medium rounded-[8px] border border-[#38383A] transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-[#0A84FF]" />
                <span>Copy</span>
              </button>
              <button
                onClick={() => setShowSensitive(!showSensitive)}
                className="py-2 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] text-[#F5F5F7] font-medium rounded-[8px] border border-[#38383A] transition flex items-center justify-center gap-1.5"
              >
                {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSensitive ? 'Hide' : 'Reveal'}</span>
              </button>
              <button
                onClick={() => setShowCVV(!showCVV)}
                className="py-2 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] text-[#F5F5F7] font-medium rounded-[8px] border border-[#38383A] transition flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{showCVV ? 'Hide CVV' : 'Show CVV'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-7 space-y-6 text-[13px]">
          {/* 1. Theme Finishes */}
          <div>
            <label className="block font-medium text-[#8E8E93] text-[11px] uppercase tracking-wider mb-2.5">
              1. Card Finish Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.values(CARD_THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdateActiveCard({ theme: t.id })}
                  className={`p-3 rounded-[8px] border flex items-center space-x-2.5 transition active:scale-[0.98] text-left ${
                    activeCard.theme === t.id
                      ? 'border-[#0A84FF] bg-[#0A84FF]/10 text-white'
                      : 'border-[#38383A] hover:border-[#48484A] bg-[#2C2C2E] text-[#8E8E93]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full ${t.bg} border border-[#38383A] shadow-sm shrink-0`}></div>
                  <span className="font-medium text-[13px] truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Textures */}
          <div>
            <label className="block font-medium text-[#8E8E93] text-[11px] uppercase tracking-wider mb-2.5">
              2. Holographic Surface Texture
            </label>
            <div className="grid grid-cols-2 min-[440px]:grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'circuit', name: 'Circuit Grid' },
                { id: 'dots', name: 'Dot Matrix' },
                { id: 'lines', name: 'Laser Lines' },
                { id: 'waves', name: 'Wave Radial' },
                { id: 'none', name: 'Clean Solid' },
              ].map((tex) => (
                <button
                  key={tex.id}
                  onClick={() => onUpdateActiveCard({ texture: tex.id })}
                  className={`py-2 px-3 rounded-[8px] border font-medium text-center transition active:scale-[0.98] text-[12px] ${
                    (activeCard.texture || 'none') === tex.id
                      ? 'border-[#0A84FF] bg-[#0A84FF]/15 text-[#0A84FF]'
                      : 'border-[#38383A] text-[#8E8E93] hover:text-[#F5F5F7] bg-[#2C2C2E]'
                  }`}
                >
                  {tex.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Card Network */}
          <div>
            <label className="block font-medium text-[#8E8E93] text-[11px] uppercase tracking-wider mb-2.5">
              3. Payment Network
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {['VISA', 'Mastercard', 'AMEX'].map((b) => (
                <button
                  key={b}
                  onClick={() => onUpdateActiveCard({ brand: b })}
                  className={`py-2 rounded-[8px] border font-medium transition text-center active:scale-[0.98] text-[13px] ${
                    activeCard.brand === b
                      ? 'border-[#0A84FF] bg-[#0A84FF] text-white shadow-sm'
                      : 'border-[#38383A] text-[#8E8E93] hover:text-[#F5F5F7] bg-[#2C2C2E]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Edit Card & Holder Details */}
          <div className="pt-5 border-t border-[#38383A] space-y-4">
            <label className="block font-medium text-[#8E8E93] text-[11px] uppercase tracking-wider">
              4. Card Identity &amp; Holder Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8E8E93] font-medium text-[12px] mb-1">Card Alias / Label</label>
                <input
                  type="text"
                  value={activeCard.label}
                  onChange={(e) => onUpdateActiveCard({ label: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[#8E8E93] font-medium text-[12px] mb-1">Holder Printed Name</label>
                <input
                  type="text"
                  value={activeCard.cardHolderName}
                  onChange={(e) => onUpdateActiveCard({ cardHolderName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] uppercase focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] font-mono text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[#8E8E93] font-medium text-[12px] mb-1">First Name</label>
                <input
                  type="text"
                  value={activeCard.firstName}
                  onChange={(e) => onUpdateActiveCard({ firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[#8E8E93] font-medium text-[12px] mb-1">Last Name</label>
                <input
                  type="text"
                  value={activeCard.lastName}
                  onChange={(e) => onUpdateActiveCard({ lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] text-[13px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#8E8E93] font-medium text-[12px] mb-1">Billing Street Address</label>
                <input
                  type="text"
                  value={activeCard.currentAddress}
                  onChange={(e) => onUpdateActiveCard({ currentAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[#8E8E93] font-medium text-[12px] mb-1">City, State &amp; Country</label>
                <input
                  type="text"
                  value={activeCard.cityState}
                  onChange={(e) => onUpdateActiveCard({ cityState: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[#8E8E93] font-medium text-[12px] mb-1">Postal / Zip Code</label>
                <input
                  type="text"
                  value={activeCard.zipCode}
                  onChange={(e) => onUpdateActiveCard({ zipCode: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] font-mono text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[#8E8E93] font-medium text-[12px] mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={activeCard.phoneNumber}
                  onChange={(e) => onUpdateActiveCard({ phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[#8E8E93] font-medium text-[12px] mb-1">Secondary Phone</label>
                <input
                  type="text"
                  value={activeCard.secondaryPhone}
                  onChange={(e) => onUpdateActiveCard({ secondaryPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] text-[13px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
