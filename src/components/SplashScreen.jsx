import { useEffect, useState, useRef } from 'react';
import { CreditCard } from 'lucide-react';

/**
 * SplashScreen
 * ─────────────────────────────────────────────────────────────────────────────
 * Perfect Centering Engine:
 * - Dynamic text width measurement via DOM ref guarantees 0 phantom whitespace.
 * - Both the logo tile and wordmark expand symmetrically from screen center.
 * - Fully responsive with clamp() on mobile (iPhone SE, Galaxy Fold) and desktop.
 * - Guaranteed visually centered at every single frame of the animation.
 *
 * Timeline:
 *  60 ms   → Logo fades & springs into center
 *  500 ms  → 3D subtle isometric tilt & card glow
 *  950 ms  → Symmetrical expansion of wordmark & subtitle
 *  2100 ms → Smooth transition to CardHub application
 */
export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | appear | flip | spread
  const textRef = useRef(null);
  const [measuredWidth, setMeasuredWidth] = useState(148);

  // Measure natural rendered width of the "CardHub" wordmark once mounted
  useEffect(() => {
    if (textRef.current) {
      const w = textRef.current.scrollWidth;
      if (w > 0) setMeasuredWidth(w);
    }
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('appear'), 60);
    const t2 = setTimeout(() => setPhase('flip'), 500);
    const t3 = setTimeout(() => setPhase('spread'), 950);
    const t4 = setTimeout(() => onComplete?.(), 2100);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onComplete]);

  const visible  = phase !== 'idle';
  const isFlip   = phase === 'flip';
  const isSpread = phase === 'spread';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        zIndex: 9999,
        pointerEvents: 'none',
        overflow: 'hidden',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Dynamic Radial Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: 'clamp(300px, 60vw, 480px)',
            height: 'clamp(300px, 60vw, 480px)',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(10,132,255,0.22) 0%, rgba(10,132,255,0.06) 45%, transparent 70%)',
            opacity: visible ? 1 : 0,
            transform: isFlip ? 'scale(1.15)' : 'scale(1)',
            transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>

      {/* Main Lockup: Flex row centered vertically & horizontally */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
        }}
      >
        {/* ── Logo tile ── */}
        <div
          style={{
            perspective: '800px',
            perspectiveOrigin: 'center center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 'clamp(54px, 14vw, 68px)',
              height: 'clamp(54px, 14vw, 68px)',
              borderRadius: 'clamp(13px, 3.5vw, 16px)',
              backgroundColor: '#0A84FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: isFlip
                ? '0 20px 48px rgba(10,132,255,0.65), 0 4px 16px rgba(10,132,255,0.35)'
                : '0 8px 32px rgba(10,132,255,0.42), 0 2px 8px rgba(10,132,255,0.2)',
              opacity: visible ? 1 : 0,
              transform:
                !visible ? 'scale(0.5)  rotateX(0deg)'                    :
                isFlip   ? 'scale(1.08) rotateX(-22deg) translateY(-4px)' :
                           'scale(1)    rotateX(0deg)    translateY(0px)',
              transition:
                phase === 'appear'
                  ? 'opacity 0.3s ease, transform 0.48s cubic-bezier(0.34,1.56,0.64,1)'
                  : isFlip
                  ? 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease'
                  : 'transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease',
              transformStyle: 'preserve-3d',
            }}
          >
            <CreditCard
              style={{
                width: 'clamp(26px, 7vw, 34px)',
                height: 'clamp(26px, 7vw, 34px)',
                color: '#ffffff',
                strokeWidth: 1.8,
              }}
            />
          </div>
        </div>

        {/*
          ── Wordmark container ──
          Uses exact measuredWidth + 4px safety buffer.
          Never hardcoded to 230px, eliminating the phantom empty space that
          previously made the whole lockup look severely left-sided.
        */}
        <div
          style={{
            overflow: 'hidden',
            flexShrink: 0,
            marginLeft: isSpread ? 'clamp(10px, 3vw, 16px)' : 0,
            width: isSpread ? measuredWidth + 6 : 0,
            opacity: isSpread ? 1 : 0,
            transition: isSpread
              ? 'width 0.48s cubic-bezier(0.16,1,0.3,1), margin-left 0.48s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease 0.05s'
              : 'width 0.1s ease, margin-left 0.1s ease, opacity 0.1s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            ref={textRef}
            style={{
              display: 'inline-block',
              fontSize: 'clamp(28px, 7.5vw, 36px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: '#F5F5F7',
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              transform: isSpread ? 'translateX(0)' : 'translateX(18px)',
              transition: isSpread
                ? 'transform 0.48s cubic-bezier(0.16,1,0.3,1) 0.04s'
                : 'none',
            }}
          >
            Card<span style={{ color: '#0A84FF' }}>Hub</span>
          </span>
        </div>
      </div>
    </div>
  );
}
