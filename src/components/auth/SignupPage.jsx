import { useState } from 'react';
import {
  CreditCard, Shield, Lock, Eye, EyeOff, User, Mail, Phone,
  MapPin, AlertCircle, ArrowRight, CheckCircle2, Zap
} from 'lucide-react';
import { signUpWithEmail, getAuthErrorMessage, sendUserEmailVerification } from '../../lib/authService';
import { createUserProfile } from '../../lib/firestoreService';
import { checkEmailExists } from '../../utils/emailValidator';

export default function SignupPage({ onSignupSuccess, onGoToLogin, onGoToAdminLogin }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    address: '', cityState: '', zipCode: '', termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Good', color: 'bg-amber-400' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = calculatePasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in your full name, email address, and password.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }
    if (!form.termsAccepted) {
      setError('Please accept the terms of service to continue.');
      return;
    }

    setError('');
    setLoading(true);

    // Step 1: Verify email domain exists
    setLoadingStep('Verifying email address…');
    try {
      const emailCheck = await checkEmailExists(form.email.trim());
      if (!emailCheck.exists) {
        setError(emailCheck.error || "Email doesn't exist. Please use a real, active email address.");
        setLoading(false);
        setLoadingStep('');
        return;
      }
    } catch {
      // DNS check failed (network issue) — let Firebase handle validation
    }

    // Step 2: Create Firebase Auth account
    setLoadingStep('Creating your account…');
    let firebaseCredential;
    try {
      firebaseCredential = await signUpWithEmail(
        form.email.trim().toLowerCase(),
        form.password,
        form.name.trim()
      );
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setLoading(false);
      setLoadingStep('');
      return;
    }

    // Step 3: Build user profile
    const uid = firebaseCredential.user.uid;
    const newUser = {
      id: uid, uid,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || '',
      address: form.address.trim() || '',
      cityState: form.cityState.trim() || '',
      zipCode: form.zipCode.trim() || '',
      role: 'customer',
      status: 'active',
      isFirstLogin: true,
      emailVerified: false,
      createdAt: Date.now(),
      cardCount: 0,
      primaryCard: null,
    };

    // Step 4: Dispatch verification email in background
    sendUserEmailVerification(firebaseCredential.user).catch((vErr) => {
      console.warn('[Signup] Notice on sending verification email:', vErr);
    });

    // Step 5: Save to Firestore
    setLoadingStep('Setting up your vault…');
    try {
      await createUserProfile(uid, newUser);
    } catch (dbError) {
      console.error('Firestore profile save failed:', dbError);
    }

    setLoading(false);
    setLoadingStep('');
    onSignupSuccess(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-100 relative overflow-hidden">

      {/* Ambient background */}
      <div className="absolute -top-48 -right-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl relative animate-fade-in-up my-6">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-slate-800/60">

          {/* ── Left brand panel ── */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              {/* Logo */}
              <div className="flex items-center space-x-3 mb-10">
                <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 animate-glow-pulse">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight block leading-none text-white">CardHub</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">Virtual Card Platform</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold mb-5">
                <Zap className="w-3.5 h-3.5" />
                <span>Create Your Account</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black mb-4 leading-tight tracking-tight animate-slide-in-left">
                Open Your Digital Card Vault
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Issue virtual payment cards, set per-merchant spending limits, block unwanted subscriptions, and keep your real card details private.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { icon: Shield,      label: 'Zero-liability fraud protection',   color: 'text-emerald-400' },
                  { icon: Lock,        label: 'End-to-end encrypted storage',       color: 'text-indigo-400'  },
                  { icon: CreditCard,  label: 'Instant virtual card issuance',      color: 'text-sky-400'     },
                  { icon: CheckCircle2,label: 'Full subscription control',          color: 'text-violet-400'  },
                ].map(({ icon: Icon, label, color }, i) => (
                  <div key={label} className={`flex items-center gap-2.5 text-xs text-slate-300 animate-slide-in-left delay-${(i + 1) * 75}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/5 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-500" />
                PCI-DSS Level 1 Compliant
              </span>
              <span className="font-mono">TLS 1.3 · AES-256</span>
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Create Your Account</h2>
                <p className="text-xs text-slate-400 mt-1">Fill in your details to get started</p>
              </div>
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Sign In Instead
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-2xl flex items-start gap-3 shadow-lg shadow-rose-950/30 backdrop-blur-md animate-in fade-in duration-200">
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold block text-rose-200 text-[11px] mb-0.5 uppercase tracking-wider font-mono">Validation Alert</span>
                  <span className="leading-snug">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text" required placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email" required placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel" placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">City, State / Region</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text" placeholder="New York, NY, USA"
                      value={form.cityState}
                      onChange={(e) => setForm({ ...form, cityState: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'} required placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'} required placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password strength */}
              {form.password && (
                <div className="flex items-center gap-2.5 pt-0.5 animate-fade-in">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div key={level} className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= level ? strength.color : 'bg-slate-700'}`} />
                    ))}
                  </div>
                  <span className={`text-[10px] font-semibold ${strength.score === 3 ? 'text-emerald-400' : strength.score === 2 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {strength.label}
                  </span>
                </div>
              )}

              {/* Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.termsAccepted}
                    onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 leading-tight group-hover:text-slate-300 transition-colors">
                    I agree to the CardHub{' '}
                    <a
                      href="https://cardhub.io/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
                    >Terms of Service</a>
                    {' '}and{' '}
                    <a
                      href="https://cardhub.io/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
                    >Privacy Policy</a>.
                    My credentials are protected by industry-standard encryption.
                  </span>
                </label>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/35 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-xs group"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{loadingStep || 'Creating account…'}</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account &amp; Continue</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-800/60 text-center flex flex-col gap-2">
              <div>
                <span className="text-slate-500 text-xs">Already have an account? </span>
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors"
                >
                  Sign In to CardHub
                </button>
              </div>
              {onGoToAdminLogin && (
                <div>
                  <button
                    type="button"
                    onClick={onGoToAdminLogin}
                    className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    Administrator Portal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
