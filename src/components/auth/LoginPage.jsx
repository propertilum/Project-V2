import { useState } from 'react';
import {
  CreditCard, Shield, Lock, Eye, EyeOff, User, AlertCircle,
  ArrowRight, Zap, UserPlus, CheckCircle2
} from 'lucide-react';
import { signInWithEmail, getAuthErrorMessage } from '../../lib/authService';
import { getUserProfile } from '../../lib/firestoreService';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../lib/firebase';

// Admin secret password — only reachable after the shift-click activation
const ADMIN_SECRET_PASSWORD = 'cardhub-admin-2025!';

// Admin access is restricted — hidden behind a secret key combo.
// The toggle is NOT shown to regular users in the UI.
// To reveal admin mode: hold Shift and click the CardHub logo 5 times.
const ADMIN_CLICK_THRESHOLD = 5;

export default function LoginPage({
  onLoginSuccess,
  onGoToSignup,
  registeredUsers = []
}) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Secret: Shift-click logo 5 times to reveal admin mode
  const handleLogoClick = (e) => {
    if (!e.shiftKey) return;
    const next = adminClickCount + 1;
    setAdminClickCount(next);
    if (next >= ADMIN_CLICK_THRESHOLD) {
      setIsAdminMode(true);
      setAdminClickCount(0);
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

    // ── Admin login ── (only reachable via secret shift-click mode)
    // BUG-07 FIX: password is now validated against the admin secret
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
      // Offline/Demo fallback when Firebase credentials are not yet configured in Vercel
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
      // BUG-05 FIX: honour the "Keep me signed in" checkbox via Firebase persistence
      if (auth) {
        await setPersistence(
          auth,
          form.remember ? browserLocalPersistence : browserSessionPersistence
        ).catch(() => {});
      }

      const credential = await signInWithEmail(normalizedEmail, form.password);
      const uid = credential.user.uid;
      const isEmailVerified = Boolean(credential.user.emailVerified);

      // Check whether this user has already created cards in local storage
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
          setError('Your account has been suspended. Please contact support.');
          setLoading(false);
          return;
        }

        // Merge latest email verification status
        const mergedProfile = {
          ...userProfile,
          id: userProfile.id || uid,
          uid,
          emailVerified: isEmailVerified || userProfile.emailVerified || false,
          isFirstLogin: hasExistingCards ? false : (userProfile.isFirstLogin === false ? false : !userProfile.primaryCard),
        };

        // Persist profile by UID so it survives logouts
        try {
          localStorage.setItem(`cardhub_profile_${uid}`, JSON.stringify(mergedProfile));
        } catch { /* ignore */ }

        setLoading(false);
        onLoginSuccess(mergedProfile, 'customer');
        return;
      }

      // 2. Check the persistent UID profile cache (survives logouts)
      try {
        const persistentProfileRaw = localStorage.getItem(`cardhub_profile_${uid}`);
        if (persistentProfileRaw) {
          const cachedProfile = JSON.parse(persistentProfileRaw);
          const restored = {
            ...cachedProfile,
            id: uid,
            uid,
            email: normalizedEmail,
            emailVerified: isEmailVerified || cachedProfile.emailVerified || false,
            isFirstLogin: hasExistingCards ? false : (cachedProfile.isFirstLogin === false ? false : !cachedProfile.primaryCard),
          };
          setLoading(false);
          onLoginSuccess(restored, 'customer');
          return;
        }
      } catch { /* ignore parse errors */ }

      // 3. Fallback: local registered users array
      const localUser = registeredUsers.find((u) => u.email?.toLowerCase() === normalizedEmail);
      if (localUser) {
        if (localUser.status === 'suspended') {
          setError('Your account has been suspended. Please contact support.');
          setLoading(false);
          return;
        }
        const mergedUser = {
          ...localUser,
          id: localUser.id || uid,
          uid,
          email: normalizedEmail,
          emailVerified: isEmailVerified || localUser.emailVerified || false,
          isFirstLogin: hasExistingCards ? false : (localUser.isFirstLogin === false ? false : !localUser.primaryCard),
        };
        try {
          localStorage.setItem(`cardhub_profile_${uid}`, JSON.stringify(mergedUser));
        } catch { /* ignore */ }
        setLoading(false);
        onLoginSuccess(mergedUser, 'customer');
        return;
      }

      // 4. Auth succeeded but genuinely no profile anywhere — if they already have cards, it's not first login
      const minimalUser = {
        id: uid, uid,
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-100 relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Admin mode secret indicator */}
      {isAdminMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 animate-fade-in">
          <div className="px-3 py-1 bg-rose-950/80 border border-rose-700/50 text-rose-400 text-[10px] font-bold rounded-full backdrop-blur-sm">
            Administrator Mode — Restricted
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl relative animate-fade-in-up">
        <div className={`bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border transition-all duration-500 ${
          isAdminMode ? 'border-rose-800/50' : 'border-slate-800/60'
        }`}>

          {/* ── Left panel ── */}
          <div className={`text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden transition-all duration-700 ${
            isAdminMode
              ? 'bg-gradient-to-br from-slate-950 via-rose-950/30 to-slate-900'
              : 'bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-900'
          }`}>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none bg-indigo-600/10" />

            <div className="relative">
              {/* Logo — secret shift-click target */}
              <div
                className="flex items-center space-x-3 mb-10 cursor-default select-none"
                onClick={handleLogoClick}
                title=""
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500 animate-glow-pulse ${
                  isAdminMode ? 'bg-rose-600 shadow-rose-600/30' : 'bg-indigo-600 shadow-indigo-600/30'
                }`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight block leading-none text-white">CardHub</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">
                    Virtual Card Platform
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold mb-5">
                <Zap className="w-3.5 h-3.5" />
                <span>{isAdminMode ? 'Restricted Access' : 'Secure Customer Access'}</span>
              </div>

              <h1 className="text-3xl font-black mb-4 leading-tight tracking-tight text-white">
                {isAdminMode ? 'Platform Administration' : 'Your Virtual Card Vault'}
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                {isAdminMode
                  ? 'Restricted portal for platform operators. Monitor accounts, audit card activity, and enforce security policies.'
                  : 'Issue unlimited virtual cards, set merchant-level spend caps, isolate subscriptions, and control your digital spending.'}
              </p>

              {!isAdminMode && (
                <div className="mt-8 space-y-3">
                  {[
                    { icon: Shield,       label: 'Zero-liability fraud protection', color: 'text-emerald-400' },
                    { icon: Lock,         label: 'End-to-end encrypted vault',       color: 'text-indigo-400'  },
                    { icon: CreditCard,   label: 'Instant virtual card issuance',    color: 'text-sky-400'     },
                    { icon: CheckCircle2, label: 'Full subscription control',        color: 'text-violet-400'  },
                  ].map(({ icon: Icon, label, color }, i) => (
                    <div key={label} className={`flex items-center gap-2.5 text-xs text-slate-300 animate-slide-in-left delay-${(i + 1) * 75}`}>
                      <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-5 border-t border-white/5 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                PCI-DSS Level 1 Compliant
              </span>
              <span className="font-mono">TLS 1.3 · AES-256</span>
            </div>
          </div>

          {/* ── Right panel: Form ── */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-slate-900">

            <div className="mb-7">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {isAdminMode ? 'Administrator Sign In' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5">
                {isAdminMode
                  ? 'Enter your administrator credentials.'
                  : 'Sign in to access your cards, balance, and spending controls.'}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-2xl flex items-start gap-3 shadow-lg shadow-rose-950/30 backdrop-blur-md animate-in fade-in duration-200">
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold block text-rose-200 text-[11px] mb-0.5 uppercase tracking-wider font-mono">Authentication Alert</span>
                  <span className="leading-snug">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email" required autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                    className="rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-slate-600">256-bit encrypted</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-xs shadow-lg group ${
                  isAdminMode
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying…</span>
                  </>
                ) : (
                  <>
                    <span>{isAdminMode ? 'Enter Admin Console' : 'Sign In to CardHub'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Admin mode exit */}
            {isAdminMode && (
              <button
                type="button"
                onClick={() => { setIsAdminMode(false); setAdminClickCount(0); setError(''); setForm({ email: '', password: '', remember: false }); }}
                className="mt-4 text-xs text-slate-600 hover:text-slate-400 transition-colors text-center w-full"
              >
                ← Back to customer sign in
              </button>
            )}

            {/* Signup link (hidden in admin mode) */}
            {!isAdminMode && (
              <div className="mt-6 pt-5 border-t border-slate-800/70 flex flex-col items-center gap-2.5 text-xs">
                <span className="text-slate-500">Don't have an account yet?</span>
                <button
                  type="button"
                  onClick={onGoToSignup}
                  className="w-full py-2.5 bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 font-semibold rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <UserPlus className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Create a CardHub Account</span>
                </button>
              </div>
            )}

            {isAdminMode && (
              <div className="mt-5 text-center text-[11px] text-slate-700">
                All administrative actions are logged and audited.
              </div>
            )}
          </div>
        </div>

        {/* Contact note — only for admin */}
        {isAdminMode && (
          <p className="text-center text-[11px] text-slate-700 mt-3 animate-fade-in">
            Don't have admin credentials? Contact the platform owner to request access.
          </p>
        )}
      </div>
    </div>
  );
}
