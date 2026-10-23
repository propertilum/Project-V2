import { useState, useEffect } from 'react';
import { Lock, Flame, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';
import { CARD_THEMES, CARD_TEXTURES } from '../../data/constants';
import { formatCurrency } from '../../utils/formatters';
import { getFullCardNumber, getCvv } from '../../utils/cardGenerator';

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
  const texture = CARD_TEXTURES[card.texture || 'circuit'] || CARD_TEXTURES.circuit;

  const isExpired = Boolean(card.isBurner && (card.isBurned || (card.expiresAt && now > card.expiresAt)));
  const isBurner = card.isBurner || card.type === 'burner';
  const isDemo = card.source === 'demo';
  const isBankCard = card.source === 'bank_connection';

  const monthlyLimit = parseFloat(card.monthlyLimit) || 0;
  const currentSpend = parseFloat(card.currentSpend) || 0;
  const percentUsed = monthlyLimit > 0 ? Math.min(100, Math.round((currentSpend / monthlyLimit) * 100)) : 0;
  const isNearingCap = percentUsed >= 80;

  const statusLabel = card.isLocked
    ? 'FROZEN'
    : isExpired
      ? 'EXPIRED'
      : isNearingCap
        ? 'NEAR CAP'
        : isDemo
          ? 'SIMULATION'
          : 'ACTIVE';

  const statusColor = card.isLocked
    ? 'bg-[#FF453A]'
    : isExpired
      ? 'bg-[#FF9F0A]'
      : isNearingCap
        ? 'bg-[#FF9F0A]'
        : isDemo
          ? 'bg-[#BF5AF2]'
          : 'bg-[#34C759]';

  const formatDisplayNumber = () => {
    const full = getFullCardNumber(card);
    if (showNumber) return full;
    const last4 = card?.last4 || full.slice(-4) || '4242';
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <div
      className={`relative w-full aspect-[1.586/1] bg-[#111418] text-[#F5F5F7] rounded-[14px] p-5 sm:p-6 shadow-md border border-white/[0.08] hover:border-white/[0.16] flex flex-col justify-between overflow-hidden transition-all duration-150 select-none group ${
        card.isLocked ? 'opacity-90' : ''
      } ${className}`}
    >
      {/* 1. Deep Obsidian Polycarbonate Tint & Sheen */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient || 'from-[#111418] via-[#141A22] to-[#0A1628]'} opacity-90 pointer-events-none`} />
      <div className="absolute inset-0 cardhub-polycarbonate-sheen pointer-events-none" />

      {/* 2. Microscopic Circuit-Grid Texture */}
      <div className={`absolute inset-0 ${texture || 'cardhub-circuit-grid opacity-70'} pointer-events-none`} />

      {/* 3. Watermark Abstract Vector Geometry */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.04] pointer-events-none text-white">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="50" cy="50" r="45" strokeDasharray="3 3" />
          <path d="M50 5 L50 95 M5 50 L95 50" />
          <rect x="25" y="25" width="50" height="50" rx="6" />
        </svg>
      </div>

      {/* 4. Frozen & Expired Security Lockout Overlay */}
      {card.isLocked && (
        <div className="absolute inset-0 bg-[#000000]/88 z-30 backdrop-blur-[3px] flex flex-col items-center justify-center text-[#FF453A] font-medium p-4 text-center animate-fade-in">
          <div className="w-10 h-10 rounded-[10px] bg-[#FF453A]/15 border border-[#FF453A]/30 flex items-center justify-center mb-2 shadow-sm">
            <Lock className="w-5 h-5 text-[#FF453A]" />
          </div>
          <span className="font-mono tracking-[0.2em] text-[11px] font-bold text-[#FF453A] uppercase">
            SECURITY PROTOCOL // LOCKED
          </span>
          <span className="text-[10px] text-[#8E8E93] font-mono mt-0.5">
            Hardware kill-switch engaged • Authorizations dropped
          </span>
        </div>
      )}

      {isExpired && !card.isLocked && (
        <div className="absolute inset-0 bg-[#000000]/88 z-30 backdrop-blur-[3px] flex flex-col items-center justify-center text-[#FF9F0A] font-medium p-4 text-center animate-fade-in">
          <div className="w-10 h-10 rounded-[10px] bg-[#FF9F0A]/15 border border-[#FF9F0A]/30 flex items-center justify-center mb-2 shadow-sm">
            <Flame className="w-5 h-5 text-[#FF9F0A]" />
          </div>
          <span className="font-mono tracking-[0.2em] text-[11px] font-bold text-[#FF9F0A] uppercase">
            TOKEN EXPIRED // BURNED
          </span>
          <span className="text-[10px] text-[#8E8E93] font-mono mt-0.5">
            Single-use credential consumed and permanently destroyed
          </span>
        </div>
      )}

      {/* ── Top Row: Purpose Header Badge & Digital Status Pulse ── */}
      <div className="flex justify-between items-center relative z-10">
        {/* Purpose Header Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08] text-xs font-semibold text-[#F5F5F7] tracking-tight shadow-sm max-w-[200px] truncate">
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor} shrink-0`} />
            <span className="truncate">{card.label || 'CardHub Vault'}</span>
          </div>

          {isBurner && (
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-[5px] bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/20 font-bold shrink-0">
              BURNER
            </span>
          )}
        </div>

        {/* Digital Status Pulse & Payment Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/50 border border-white/[0.08] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              {!card.isLocked && !isExpired && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColor}`} />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColor}`} />
            </span>
            <span className="text-[10px] font-mono font-semibold tracking-wider text-[#8E8E93]">
              {statusLabel}
            </span>
          </div>

          <div className="text-right font-mono font-extrabold text-sm tracking-tight text-[#F5F5F7] drop-shadow-sm">
            {card.brand === 'Mastercard' ? (
              <div className="flex -space-x-1.5 items-center">
                <div className="w-4 h-4 rounded-full bg-[#FF453A] opacity-90 shadow-sm" />
                <div className="w-4 h-4 rounded-full bg-[#FF9F0A] opacity-90 shadow-sm" />
              </div>
            ) : card.brand === 'AMEX' ? (
              <span className="bg-[#0A84FF] text-white text-[9px] px-1.5 py-0.5 rounded-[3px]">AMEX</span>
            ) : (
              <span>VISA</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Middle: Monospaced Security Block ── */}
      <div className="my-auto py-2 relative z-10 space-y-2">
        {/* Row 1: Chip + Full-width Card Number */}
        <div className="flex items-center gap-3">
          {/* Cryptographic Security Chip Element */}
          <div className="w-8 h-6 rounded-[5px] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-white/[0.12] flex items-center justify-center p-1 shadow-inner shrink-0">
            <Cpu className="w-4 h-4 text-[#0A84FF] opacity-90" />
          </div>

          {/* Masked / Revealed Card Number — full row, no competing sibling */}
          <div className="font-mono text-base sm:text-xl font-bold tracking-[0.16em] text-[#F5F5F7] select-all tabular-nums drop-shadow-sm overflow-hidden">
            {formatDisplayNumber()}
          </div>
        </div>

        {/* Row 2: EXP / CVV block + optional Merchant Lock */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Frosted Security Details Mini-Block */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-[#8E8E93] bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-[6px] border border-white/[0.08]">
            <div>
              <span className="text-[8px] uppercase tracking-wider block text-[#636366] leading-none mb-0.5">EXP</span>
              <span className="text-[#F5F5F7] font-semibold leading-none">{card.expDate || '12/28'}</span>
            </div>
            <div className="border-l border-white/[0.08] pl-2.5">
              <span className="text-[8px] uppercase tracking-wider block text-[#636366] leading-none mb-0.5">CVV</span>
              <span className="text-[#F5F5F7] font-semibold leading-none">{showCVV ? getCvv(card) : '•••'}</span>
            </div>
          </div>

          {card.merchantLock && (
            <div className="flex items-center gap-1.5 text-[10px] text-[#0A84FF] font-mono">
              <ShieldAlert className="w-3 h-3 text-[#0A84FF] shrink-0" />
              <span className="truncate">Merchant Lock: {card.merchantLock}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Lower Row: Dynamic Spending Cap & Enforcement Stamp ── */}
      <div className="pt-2 border-t border-white/[0.06] flex items-end justify-between gap-4 text-xs relative z-10">
        {/* Dynamic Budget Cap */}
        <div className="flex-1 max-w-[240px] space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#8E8E93] uppercase tracking-wider">Spend Cap</span>
            <span className="text-[#F5F5F7] font-semibold tabular-nums">
              {monthlyLimit > 0 ? (
                `${formatCurrency(currentSpend)} / ${formatCurrency(monthlyLimit)}`
              ) : (
                `Max ${formatCurrency(card.perTxLimit || 100)} / tx`
              )}
            </span>
          </div>
          {monthlyLimit > 0 && (
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  percentUsed > 90 ? 'bg-[#FF453A]' : percentUsed > 70 ? 'bg-[#FF9F0A]' : 'bg-[#34C759]'
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          )}
        </div>

        {/* High-Precision Enforcement Stamp */}
        <div className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-black/60 border border-white/[0.08] text-[9px] font-mono tracking-[0.14em] uppercase text-[#8E8E93]">
          <ShieldCheck className="w-3 h-3 text-[#0A84FF]" />
          <span>
            {isBankCard
              ? 'CARDHUB // MONITORED'
              : isDemo
                ? 'CARDHUB // SIMULATION'
                : 'CARDHUB // ENFORCED'}
          </span>
        </div>
      </div>
    </div>
  );
}
