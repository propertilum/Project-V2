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
    <div className="bg-[#111418] rounded-2xl border border-[#262B33] p-6 md:p-8 shadow-lg space-y-8 text-slate-200">
      {/* Studio Header */}
      <div className="border-b border-[#262B33] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Card Studio Customizer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrate visual physical card simulations, network branding, and client billing records.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-3 py-1.5 rounded-full border border-indigo-800/80 w-fit">
          Editing: {activeCard.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Sticky Card Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-sm space-y-4">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono text-center">
              Real-Time Card Canvas
            </span>

            <CardPreview
              card={activeCard}
              showNumber={showSensitive}
              showCVV={showCVV}
            />

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => onCopy(activeCard.cardNumber, 'Card Number')}
                className="py-2.5 bg-[#161B22] hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-[#262B33] transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Copy</span>
              </button>
              <button
                onClick={() => setShowSensitive(!showSensitive)}
                className="py-2.5 bg-[#161B22] hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-[#262B33] transition flex items-center justify-center gap-1.5"
              >
                {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSensitive ? 'Hide' : 'Reveal'}</span>
              </button>
              <button
                onClick={() => setShowCVV(!showCVV)}
                className="py-2.5 bg-[#161B22] hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-[#262B33] transition flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{showCVV ? 'Hide CVV' : 'Show CVV'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-7 space-y-6 text-xs">
          {/* 1. Theme Finishes */}
          <div>
            <label className="block font-bold text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-2.5">
              1. Card Finish Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.values(CARD_THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdateActiveCard({ theme: t.id })}
                  className={`p-3 rounded-xl border flex items-center space-x-2.5 transition text-left ${
                    activeCard.theme === t.id
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/40 text-white'
                      : 'border-[#262B33] hover:border-slate-700 bg-[#161B22] text-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full ${t.bg} border border-slate-700 shadow-sm shrink-0`}></div>
                  <span className="font-bold truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Textures */}
          <div>
            <label className="block font-bold text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-2.5">
              2. Holographic Surface Texture
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'waves', name: 'Wave Radial' },
                { id: 'dots', name: 'Dot Grid' },
                { id: 'lines', name: 'Micro Lines' },
                { id: 'none', name: 'Clean Solid' },
              ].map((tex) => (
                <button
                  key={tex.id}
                  onClick={() => onUpdateActiveCard({ texture: tex.id })}
                  className={`py-2 px-3 rounded-xl border font-bold text-center transition ${
                    (activeCard.texture || 'none') === tex.id
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                      : 'border-[#262B33] text-slate-400 hover:text-white bg-[#161B22]'
                  }`}
                >
                  {tex.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Card Network */}
          <div>
            <label className="block font-bold text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-2.5">
              3. Payment Network
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {['VISA', 'Mastercard', 'AMEX'].map((b) => (
                <button
                  key={b}
                  onClick={() => onUpdateActiveCard({ brand: b })}
                  className={`py-2.5 rounded-xl border font-bold transition text-center ${
                    activeCard.brand === b
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'border-[#262B33] text-slate-300 hover:text-white bg-[#161B22]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Edit Card & Holder Details */}
          <div className="pt-5 border-t border-[#262B33] space-y-4">
            <label className="block font-bold text-slate-300 font-mono text-[11px] uppercase tracking-wider">
              4. Card Identity &amp; Holder Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Card Alias / Label</label>
                <input
                  type="text"
                  value={activeCard.label}
                  onChange={(e) => onUpdateActiveCard({ label: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B22] border border-[#262B33] rounded-xl font-medium text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Holder Printed Name</label>
                <input
                  type="text"
                  value={activeCard.cardHolderName}
                  onChange={(e) => onUpdateActiveCard({ cardHolderName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B22] border border-[#262B33] rounded-xl font-medium text-white uppercase focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={activeCard.firstName}
                  onChange={(e) => onUpdateActiveCard({ firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B22] border border-[#262B33] rounded-xl font-medium text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={activeCard.lastName}
                  onChange={(e) => onUpdateActiveCard({ lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B22] border border-[#262B33] rounded-xl font-medium text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Billing Street Address</label>
                <input
                  type="text"
                  value={activeCard.currentAddress}
                  onChange={(e) => onUpdateActiveCard({ currentAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B22] border border-[#262B33] rounded-xl font-medium text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">City, State &amp; Country</label>
                <input
                  type="text"
                  value={activeCard.cityState}
                  onChange={(e) => onUpdateActiveCard({ cityState: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B22] border border-[#262B33] rounded-xl font-medium text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Postal / Zip Code</label>
                <input
                  type="text"
                  value={activeCard.zipCode}
                  onChange={(e) => onUpdateActiveCard({ zipCode: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B22] border border-[#262B33] rounded-xl font-medium text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={activeCard.phoneNumber}
                  onChange={(e) => onUpdateActiveCard({ phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B22] border border-[#262B33] rounded-xl font-medium text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Secondary Phone</label>
                <input
                  type="text"
                  value={activeCard.secondaryPhone}
                  onChange={(e) => onUpdateActiveCard({ secondaryPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B22] border border-[#262B33] rounded-xl font-medium text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
