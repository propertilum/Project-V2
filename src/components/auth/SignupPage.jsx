import { useState } from 'react';
import {
  CreditCard, Shield, Lock, Eye, EyeOff, User, Mail, Phone,
  MapPin, AlertCircle, ArrowRight, CheckCircle2, Zap
} from 'lucide-react';
import { signUpWithEmail, getAuthErrorMessage, sendUserEmailVerification } from '../../lib/authService';
import { createUserProfile } from '../../lib/firestoreService';
import { isFirebaseConfigured } from '../../lib/firebase';
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
    if (!pass) return { score: 0, label: '', color: 'bg-[#38383A]' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-[#FF453A]' };
    if (score <= 3) return { score: 2, label: 'Good', color: 'bg-[#FF9F0A]' };
    return { score: 3, label: 'Strong', color: 'bg-[#34C759]' };
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

    // Step 2: Create Account
    setLoadingStep('Creating your account…');
    let uid = `usr-${Date.now()}`;
    let isEmailVerified;

    if (isFirebaseConfigured) {
      try {
        const firebaseCredential = await signUpWithEmail(
          form.email.trim().toLowerCase(),
          form.password,
          form.name.trim()
        );
        uid = firebaseCredential.user.uid;
        isEmailVerified = Boolean(firebaseCredential.user.emailVerified);

        // Step 4: Dispatch verification email in background
        sendUserEmailVerification(firebaseCredential.user).catch((vErr) => {
          console.warn('[Signup] Notice on sending verification email:', vErr);
        });
      } catch (authError) {
        setError(getAuthErrorMessage(authError));
        setLoading(false);
        setLoadingStep('');
        return;
      }
    } else {
      isEmailVerified = true;
    }

    // Step 3: Build user profile
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
      emailVerified: isEmailVerified,
      createdAt: Date.now(),
      cardCount: 0,
      primaryCard: null,
    };

    // Step 5: Save to Firestore
    if (isFirebaseConfigured) {
      setLoadingStep('Setting up your vault…');
      try {
        await createUserProfile(uid, newUser);
      } catch (dbError) {
        console.error('Firestore profile save failed:', dbError);
      }
    }

    setLoading(false);
    setLoadingStep('');
    onSignupSuccess(newUser);
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center items-center p-4 font-sans text-[#F5F5F7] relative">
      <div className="w-full max-w-4xl relative my-6">
        <div className="bg-[#1C1C1E] rounded-[16px] overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-[#38383A]">

          {/* ── Left brand panel ── */}
          <div className="md:col-span-5 bg-[#161618] text-white p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#38383A]">
            <div>
              {/* Logo */}
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-[#0A84FF] rounded-[10px] flex items-center justify-center text-white">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[17px] font-semibold tracking-tight block leading-none text-white">CardHub</span>
                  <span className="text-[10px] font-medium tracking-wider uppercase text-[#8E8E93] mt-1 block">Virtual Card Platform</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#0A84FF] text-[11px] font-medium mb-4">
                <Zap className="w-3.5 h-3.5" />
                <span>Create Your Account</span>
              </div>

              <h1 className="text-[22px] font-bold mb-3 leading-snug tracking-tight text-white">
                Open Your Digital Card Vault
              </h1>
              <p className="text-[#8E8E93] text-[13px] leading-relaxed">
                Issue virtual payment cards, set per-merchant spending limits, block unwanted subscriptions, and keep your real card details private.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { icon: Shield,      label: 'Zero-liability fraud protection',   color: 'text-[#34C759]' },
                  { icon: Lock,        label: 'End-to-end encrypted storage',       color: 'text-[#0A84FF]' },
                  { icon: CreditCard,  label: 'Instant virtual card issuance',      color: 'text-[#0A84FF]' },
                  { icon: CheckCircle2,label: 'Full subscription control',          color: 'text-[#BF5AF2]' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2.5 text-[12px] text-[#F5F5F7]">
                    <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#38383A] text-[11px] text-[#8E8E93] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#34C759]" />
                PCI-DSS Level 1 Compliant
              </span>
              <span className="font-mono">TLS 1.3 · AES-256</span>
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-[#1C1C1E]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-semibold text-white tracking-tight">Create Your Account</h2>
                <p className="text-[12px] text-[#8E8E93] mt-0.5">Fill in your details to get started</p>
              </div>
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-[12px] text-[#0A84FF] hover:underline font-medium"
              >
                Sign In Instead
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#FF453A]/15 border border-[#FF453A]/30 text-[#FF453A] text-[12px] rounded-[8px] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold block text-[11px] uppercase tracking-wider">Validation Alert</span>
                  <span className="leading-snug text-white/90">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-[12px]">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#8E8E93] mb-1 text-[11px]">Full Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text" required placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-[#2C2C2E] border border-[#38383A] focus:border-[#0A84FF] rounded-[8px] text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#0A84FF] transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-[#8E8E93] mb-1 text-[11px]">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email" required placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-[#2C2C2E] border border-[#38383A] focus:border-[#0A84FF] rounded-[8px] text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#0A84FF] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#8E8E93] mb-1 text-[11px]">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel" placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-[#2C2C2E] border border-[#38383A] focus:border-[#0A84FF] rounded-[8px] text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#0A84FF] transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-[#8E8E93] mb-1 text-[11px]">City, State / Region</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text" placeholder="New York, NY, USA"
                      value={form.cityState}
                      onChange={(e) => setForm({ ...form, cityState: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-[#2C2C2E] border border-[#38383A] focus:border-[#0A84FF] rounded-[8px] text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#0A84FF] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#8E8E93] mb-1 text-[11px]">Password *</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'} required placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-8 pr-8 py-2 bg-[#2C2C2E] border border-[#38383A] focus:border-[#0A84FF] rounded-[8px] text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#0A84FF] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-[#8E8E93] mb-1 text-[11px]">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'} required placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-[#2C2C2E] border border-[#38383A] focus:border-[#0A84FF] rounded-[8px] text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#0A84FF] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Password strength */}
              {form.password && (
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="flex-1 h-1.5 bg-[#2C2C2E] rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div key={level} className={`h-full flex-1 rounded-full transition-all ${strength.score >= level ? strength.color : 'bg-[#38383A]'}`} />
                    ))}
                  </div>
                  <span className={`text-[10px] font-medium ${strength.score === 3 ? 'text-[#34C759]' : strength.score === 2 ? 'text-[#FF9F0A]' : 'text-[#FF453A]'}`}>
                    {strength.label}
                  </span>
                </div>
              )}

              {/* Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.termsAccepted}
                    onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded border-[#38383A] bg-[#2C2C2E] text-[#0A84FF] focus:ring-[#0A84FF]"
                  />
                  <span className="text-[11px] text-[#8E8E93] leading-tight">
                    I agree to the CardHub{' '}
                    <a
                      href="https://cardhub.io/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0A84FF] hover:underline"
                    >Terms of Service</a>
                    {' '}and{' '}
                    <a
                      href="https://cardhub.io/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0A84FF] hover:underline"
                    >Privacy Policy</a>.
                  </span>
                </label>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white font-medium rounded-[8px] flex items-center justify-center gap-2 transition disabled:opacity-50 text-[13px]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent rounded-full animate-spin" />
                      <span>{loadingStep || 'Creating account…'}</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-[#38383A] text-center flex flex-col gap-2">
              <div>
                <span className="text-[#8E8E93] text-[12px]">Already have an account? </span>
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="text-[12px] text-[#0A84FF] hover:underline font-medium ml-1"
                >
                  Sign In to CardHub
                </button>
              </div>
              {onGoToAdminLogin && (
                <div>
                  <button
                    type="button"
                    onClick={onGoToAdminLogin}
                    className="text-[11px] text-[#8E8E93] hover:text-white transition"
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
