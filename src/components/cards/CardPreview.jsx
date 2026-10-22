import { useState, useEffect } from 'react';
import { Wifi, Lock, Flame } from 'lucide-react';
import { CARD_THEMES, CARD_TEXTURES, CARD_TYPES } from '../../data/constants';

export default function CardPreview({
  card,
  showNumber = false,
  showCVV = false,
  className = '',
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!card?.isBurner || !card?.expiresAt || card?.isBurned) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [card?.isBurner, card?.expiresAt, card?.isBurned]);

  if (!card) return null;

  const theme = CARD_THEMES[card.theme] || CARD_THEMES.midnight;
  const texture = CARD_TEXTURES[card.texture || 'none'] || CARD_TEXTURES.none;
  const cardType = CARD_TYPES[card.type] || CARD_TYPES.main;

  const isExpired = Boolean(card.isBurner && (card.isBurned || (card.expiresAt && now > card.expiresAt)));

  const formatCardNumber = (num, reveal) => {
    if (!num) return '•••• •••• •••• 0000';
    if (reveal) return num;
    const clean = num.replace(/\s+/g, '');
    return `•••• •••• •••• ${clean.slice(-4)}`;
  };

  return (
    <div
      className={`relative w-full aspect-[1.586/1] ${theme.bg} ${theme.text} rounded-2xl p-5 md:p-6 shadow-2xl border ${theme.border} flex flex-col justify-between overflow-hidden transition-all duration-300 select-none ${
        card.isLocked ? 'grayscale-[0.4] opacity-80' : ''
      } ${className}`}
    >
      {/* Texture overlay */}
      <div className={`absolute inset-0 ${texture} pointer-events-none`}></div>
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* State Overlays */}
      {card.isLocked && (
        <div className="absolute inset-0 bg-slate-950/85 z-30 backdrop-blur-[2px] flex flex-col items-center justify-center text-rose-400 font-bold gap-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-rose-400" />
          </div>
          <span className="tracking-widest uppercase text-xs font-black">CARD FROZEN</span>
          <span className="text-[10px] text-slate-400 font-medium font-sans">Authorizations currently blocked</span>
        </div>
      )}

      {isExpired && !card.isLocked && (
        <div className="absolute inset-0 bg-slate-950/85 z-30 backdrop-blur-[2px] flex flex-col items-center justify-center text-amber-400 font-bold gap-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Flame className="w-6 h-6 text-amber-400" />
          </div>
          <span className="tracking-widest uppercase text-xs font-black">BURNED / EXPIRED</span>
          <span className="text-[10px] text-slate-400 font-medium font-sans">Temporary token destroyed</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          {/* EMV Gold Chip */}
          <div className="w-11 h-8 bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 rounded-md border border-amber-400/80 shadow-inner flex items-center justify-center p-1">
            <div className="w-full h-full border border-amber-600/40 grid grid-cols-2 gap-0.5">
              <div className="border-r border-b border-amber-700/30"></div>
              <div className="border-b border-amber-700/30"></div>
              <div className="border-r border-amber-700/30"></div>
              <div></div>
            </div>
          </div>
          {/* Contactless Wifi Icon */}
          <Wifi className="w-5 h-5 opacity-80 rotate-90" />
        </div>

        {/* Network & Purpose Brand */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
            {cardType.name}
          </span>
          <div className="text-xl font-black italic tracking-wider">
            {card.brand === 'Mastercard' ? (
              <div className="flex -space-x-2 items-center">
                <div className="w-6 h-6 rounded-full bg-red-500 opacity-90 shadow-sm"></div>
                <div className="w-6 h-6 rounded-full bg-amber-400 opacity-90 shadow-sm"></div>
              </div>
            ) : card.brand === 'AMEX' ? (
              <span className="font-sans font-extrabold text-xs bg-blue-600 text-white px-2 py-0.5 rounded shadow-sm">AMEX</span>
            ) : (
              <span className="font-black tracking-tight text-lg drop-shadow-sm">VISA</span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row: Card Number */}
      <div className="my-auto relative z-10 py-1">
        <div className="text-lg sm:text-2xl font-mono tracking-widest font-bold drop-shadow-md">
          {formatCardNumber(card.cardNumber, showNumber)}
        </div>
        {card.isBurner && card.expiresAt && !isExpired && (
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-rose-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            <span>Single-Use Active • Auto-burns after purchase</span>
          </div>
        )}
      </div>

      {/* Bottom Row: Holder & Expiry & CVV */}
      <div className="flex justify-between items-end relative z-10 text-xs">
        <div>
          <div className="text-[9px] uppercase tracking-wider font-bold opacity-60">Card Holder</div>
          <div className="font-semibold uppercase tracking-wider text-xs sm:text-sm drop-shadow-sm truncate max-w-[170px] sm:max-w-[220px]">
            {card.cardHolderName || `${card.firstName} ${card.lastName}`}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="text-[9px] uppercase tracking-wider font-bold opacity-60">Expires</div>
            <div className="font-mono font-semibold text-xs sm:text-sm drop-shadow-sm">{card.expDate}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider font-bold opacity-60">CVV</div>
            <div className="font-mono font-semibold text-xs sm:text-sm drop-shadow-sm">
              {showCVV ? card.cvv : '•••'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
