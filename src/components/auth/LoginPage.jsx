import { useState, useEffect } from 'react';
import {
  CreditCard, Shield, Lock, Eye, EyeOff, User, AlertCircle,
  ArrowRight, Zap, UserPlus, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { signInWithEmail, getAuthErrorMessage } from '../../lib/authService';
import { getUserProfile } from '../../lib/firestoreService';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../lib/firebase';

// Admin secret password — only reachable after the shift-click activation
const ADMIN_SECRET_PASSWORD = 'cardhub-admin-2025!';

// Admin access is restricted — hidden behind a secret key combo.
// To reveal admin mode: hold Shift and click the CardHub logo 5 times.
const ADMIN_CLICK_THRESHOLD = 5;

export default function LoginPage({
  onLoginSuccess,
  onGoToSignup,
  registeredUsers = [],
  initialMobileView = 'welcome'
}) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [mobileAuthView, setMobileAuthView] = useState(initialMobileView);
  const [isMobileTransitioning, setIsMobileTransitioning] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMobileAuthView(initialMobileView);
  }, [initialMobileView]);

  const handleMobileSwitch = (view) => {
    setIsMobileTransitioning(true);
    setTimeout(() => {
      setMobileAuthView(view);
      setIsMobileTransitioning(false);
    }, 180);
  };

  // Secret: Shift-click logo 5 times to reveal admin mode
  const handleLogoClick = (e) => {
    if (!e.shiftKey) return;
    const next = adminClickCount + 1;
    setAdminClickCount(next);
    if (next >= ADMIN_CLICK_THRESHOLD) {
      setIsAdminMode(true);
      setAdminClickCount(0);
      handleMobileSwitch('signin');
      setForm({ email: '', password: '', remember: false });
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email address and password.');
      return;
    }
    setError('');
    setLoading(true);

    const normalizedEmail = form.email.trim().toLowerCase();

    // ── Admin login ──
    if (isAdminMode && normalizedEmail === 'admin@cardhub.io') {
      if (form.password !== ADMIN_SECRET_PASSWORD) {
        setError('Invalid administrator credentials.');
        setLoading(false);
        return;
      }
      const adminUser = registeredUsers.find((u) => u.role === 'admin') || {
        id: 'usr-admin',
        name: 'Platform Administrator',
        email: 'admin@cardhub.io',
        role: 'admin',
      };
      setLoading(false);
      onLoginSuccess(adminUser, 'admin');
      return;
    }

    // ── Customer login ──
    if (!isFirebaseConfigured || !auth) {
      const localUser = registeredUsers.find((u) => u.email?.toLowerCase() === normalizedEmail);
      if (localUser) {
        if (localUser.status === 'suspended') {
          setError('Your account has been suspended. Please contact support.');
          setLoading(false);
          return;
        }
        setLoading(false);
        onLoginSuccess(localUser, 'customer');
        return;
      }
      setLoading(false);
      setError('Firebase environment variables are not configured in Vercel. Add VITE_FIREBASE_* in Project Settings or log in with demo account kamran@example.com.');
      return;
    }

    try {
      if (auth) {
        await setPersistence(
          auth,
          form.remember ? browserLocalPersistence : browserSessionPersistence
        ).catch(() => {});
      }

      const credential = await signInWithEmail(normalizedEmail, form.password);
      const uid = credential.user.uid;
      const isEmailVerified = Boolean(credential.user.emailVerified);

      let existingCards = [];
      try {
        const rawCards = localStorage.getItem(`cardhub_cards_${uid}`);
        if (rawCards) existingCards = JSON.parse(rawCards);
      } catch { /* ignore */ }
      const hasExistingCards = Array.isArray(existingCards) && existingCards.length > 0;

      // 1. Try Firestore profile first
      let userProfile = null;
      try {
        userProfile = await getUserProfile(uid);
      } catch (dbErr) {
        console.warn('[CardHub] Firestore profile fetch failed, falling back:', dbErr);
      }

      if (userProfile) {
        if (userProfile.status === 'suspended') {
          setError('Your account has been suspended by an administrator. Please reach out to support.');
          setLoading(false);
          return;
        }

        const sessionUser = {
          ...userProfile,
          id: uid,
          email: userProfile.email || credential.user.email,
          name: userProfile.name || credential.user.displayName || 'CardHub User',
          emailVerified: isEmailVerified,
          isFirstLogin: !hasExistingCards,
        };

        try {
          localStorage.setItem(`cardhub_profile_${uid}`, JSON.stringify(sessionUser));
        } catch { /* ignore */ }

        setLoading(false);
        onLoginSuccess(sessionUser, 'customer');
        return;
      }

      // 2. Try localStorage profile fallback
      try {
        const cachedRaw = localStorage.getItem(`cardhub_profile_${uid}`);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached.status === 'suspended') {
            setError('Your account has been suspended by an administrator.');
            setLoading(false);
            return;
          }
          const sessionUser = {
            ...cached,
            id: uid,
            emailVerified: isEmailVerified,
            isFirstLogin: !hasExistingCards,
          };
          setLoading(false);
          onLoginSuccess(sessionUser, 'customer');
          return;
        }
      } catch { /* ignore */ }

      // 3. Fallback to registered users prop
      const propMatch = registeredUsers.find((u) => u.email?.toLowerCase() === normalizedEmail);
      if (propMatch) {
        if (propMatch.status === 'suspended') {
          setError('Your account has been suspended.');
          setLoading(false);
          return;
        }
        const sessionUser = {
          ...propMatch,
          id: uid,
          emailVerified: isEmailVerified,
          isFirstLogin: !hasExistingCards,
        };
        try {
          localStorage.setItem(`cardhub_profile_${uid}`, JSON.stringify(sessionUser));
        } catch { /* ignore */ }
        setLoading(false);
        onLoginSuccess(sessionUser, 'customer');
        return;
      }

      // 4. Brand-new Firebase user with no prior profile
      const minimalUser = {
        id: uid,
        name: credential.user.displayName || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: 'customer',
        status: 'active',
        emailVerified: isEmailVerified,
        isFirstLogin: !hasExistingCards,
        createdAt: Date.now(),
      };
      try {
        localStorage.setItem(`cardhub_profile_${uid}`, JSON.stringify(minimalUser));
      } catch { /* ignore */ }
      setLoading(false);
      onLoginSuccess(minimalUser, 'customer');

    } catch (authError) {
      setLoading(false);
      setError(getAuthErrorMessage(authError));
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#000000] flex flex-col justify-center items-center p-3 sm:p-4 py-6 sm:py-8 font-sans text-[#F5F5F7] relative overflow-y-auto">

      {/* Admin mode secret indicator */}
      {isAdminMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2rem)] max-w-sm text-center">
          <div className="px-3 py-1 bg-[#FF453A]/15 border border-[#FF453A]/40 text-[#FF453A] text-[11px] font-medium rounded-full truncate">
            Administrator Mode — Restricted Access
          </div>
        </div>
      )}

      <div className={`w-full max-w-md md:max-w-4xl mx-auto my-auto relative ${
        isMobileTransitioning ? 'animate-screen-exit' : 'animate-screen-enter'
      }`}>
        <div className={`bg-[#1C1C1E] rounded-[16px] overflow-hidden grid grid-cols-1 md:grid-cols-2 border transition-all ${
          isAdminMode ? 'border-[#FF453A]/50' : 'border-[#38383A]'
        }`}>

          {/* ── Left panel / Mobile Welcome Card ── */}
          <div className={`p-5 sm:p-6 md:p-10 flex-col justify-between border-b md:border-b-0 md:border-r border-[#38383A] ${
            mobileAuthView === 'welcome' ? 'flex' : 'hidden md:flex'
          } ${isAdminMode ? 'bg-[#2C2C2E]/50' : 'bg-[#161618]'}`}>
            <div>
              {/* Logo — secret shift-click target */}
              <div
                className="flex items-center space-x-3 mb-4 md:mb-8 cursor-default select-none"
                onClick={handleLogoClick}
                title=""
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] flex items-center justify-center text-white shrink-0 ${
                  isAdminMode ? 'bg-[#FF453A]' : 'bg-[#0A84FF]'
                }`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[16px] sm:text-[17px] font-semibold tracking-tight block leading-none text-white">CardHub</span>
                  <span className="text-[10px] font-medium tracking-wider uppercase text-[#8E8E93] mt-1 block">
                    Virtual Card Vault
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#0A84FF] text-[11px] font-medium mb-3 md:mb-4">
                <Zap className="w-3.5 h-3.5" />
                <span>{isAdminMode ? 'Restricted Console' : 'Secure Customer Access'}</span>
              </div>

              <h1 className="text-[20px] sm:text-[24px] font-bold mb-2 md:mb-3 leading-snug tracking-tight text-white">
                {isAdminMode ? 'Platform Administration' : 'Your Virtual Card Vault'}
              </h1>
              <p className="text-[#8E8E93] text-[12px] sm:text-[13px] leading-relaxed">
                {isAdminMode
                  ? 'Restricted portal for platform operators. Monitor accounts, audit card activity, and enforce security policies.'
                  : 'Issue virtual cards, set merchant-level spend caps, isolate subscriptions, and control digital spending.'}
              </p>

              {!isAdminMode && (
                <div className="mt-5 md:mt-8 space-y-2.5 md:space-y-3">
                  {[
                    { icon: Shield,       label: 'Zero-liability fraud protection', color: 'text-[#34C759]' },
                    { icon: Lock,         label: 'End-to-end encrypted vault',       color: 'text-[#0A84FF]' },
                    { icon: CreditCard,   label: 'Instant virtual card issuance',    color: 'text-[#0A84FF]' },
                    { icon: CheckCircle2, label: 'Full subscription isolation',      color: 'text-[#BF5AF2]' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-2.5 text-[12px] text-[#F5F5F7]">
                      <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile Welcome Actions (< md only) */}
              {!isAdminMode && (
                <div className="mt-6 md:hidden space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleMobileSwitch('signin')}
                    className="w-full py-3 min-h-[44px] bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white font-medium rounded-[8px] flex items-center justify-center gap-2 transition text-[14px]"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onGoToSignup}
                    className="w-full py-3 min-h-[44px] bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] text-[#F5F5F7] font-medium rounded-[8px] border border-[#38383A] flex items-center justify-center gap-2 transition text-[14px]"
                  >
                    <UserPlus className="w-4 h-4 text-[#0A84FF]" />
                    <span>Create a CardHub Account</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 md:mt-8 pt-4 border-t border-[#38383A] text-[11px] text-[#8E8E93] flex flex-wrap gap-2 items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#34C759]" />
                PCI-DSS Level 1 Compliant
              </span>
              <span className="font-mono">TLS 1.3 · AES-256</span>
            </div>
          </div>

          {/* ── Right panel: Form ── */}
          <div className={`p-5 sm:p-6 md:p-10 flex-col justify-center bg-[#1C1C1E] ${
            mobileAuthView === 'signin' ? 'flex' : 'hidden md:flex'
          }`}>
            {/* Mobile Back Button (< md only) */}
            <div className="md:hidden mb-4">
              <button
                type="button"
                onClick={() => handleMobileSwitch('welcome')}
                className="inline-flex items-center gap-1.5 text-[12px] text-[#8E8E93] hover:text-white transition py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Welcome</span>
              </button>
            </div>

            <div className="mb-5 sm:mb-6">
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-white tracking-tight">
                {isAdminMode ? 'Administrator Sign In' : 'Welcome Back'}
              </h2>
              <p className="text-[12px] text-[#8E8E93] mt-1">
                {isAdminMode
                  ? 'Enter your administrator credentials.'
                  : 'Sign in to access your cards, balance, and spending controls.'}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-[#FF453A]/15 border border-[#FF453A]/30 text-[#FF453A] text-[12px] rounded-[8px] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold block text-[11px] uppercase tracking-wider">Authentication Alert</span>
                  <span className="leading-snug text-white/90">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
              <div>
                <label className="block font-medium text-[#8E8E93] mb-1.5 text-[12px]">Email Address</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email" required autoComplete="email"
                    className="w-full pl-9 pr-4 py-3 sm:py-2.5 min-h-[44px] bg-[#2C2C2E] border border-[#38383A] focus:border-[#0A84FF] rounded-[8px] text-[15px] sm:text-[13px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#0A84FF] transition"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#8E8E93] mb-1.5 text-[12px]">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-3 sm:py-2.5 min-h-[44px] bg-[#2C2C2E] border border-[#38383A] focus:border-[#0A84FF] rounded-[8px] text-[15px] sm:text-[13px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#0A84FF] transition font-mono"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8E8E93] hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8E8E93] pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer hover:text-white transition">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                    className="rounded border-[#38383A] bg-[#2C2C2E] text-[#0A84FF] focus:ring-[#0A84FF]"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="font-mono text-[10px]">256-bit encrypted</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 sm:py-2.5 min-h-[44px] text-white font-medium rounded-[8px] flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 text-[14px] sm:text-[13px] mt-2 ${
                  isAdminMode
                    ? 'bg-[#FF453A] hover:bg-[#D70015]'
                    : 'bg-[#0A84FF] hover:bg-[#0071E3]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying…</span>
                  </>
                ) : (
                  <>
                    <span>{isAdminMode ? 'Enter Admin Console' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Admin mode exit */}
            {isAdminMode && (
              <button
                type="button"
                onClick={() => { setIsAdminMode(false); setAdminClickCount(0); setError(''); setForm({ email: '', password: '', remember: false }); }}
                className="mt-4 text-[12px] text-[#8E8E93] hover:text-white transition text-center w-full"
              >
                ← Back to customer sign in
              </button>
            )}

            {/* Signup link (hidden in admin mode) */}
            {!isAdminMode && (
              <div className="mt-6 pt-5 border-t border-[#38383A] flex flex-col items-center gap-2.5 text-[12px]">
                <span className="text-[#8E8E93]">Don't have an account yet?</span>
                <button
                  type="button"
                  onClick={onGoToSignup}
                  className="w-full py-2 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] text-[#F5F5F7] font-medium rounded-[8px] border border-[#38383A] transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-[#0A84FF]" />
                  <span>Create a CardHub Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
