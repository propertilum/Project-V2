import { useState, useEffect, useCallback } from 'react';

// Data & Constants
import { INITIAL_USERS } from '../data/initialUsers';
import { INITIAL_CARDS, INITIAL_RULES } from '../data/initialData';
import { INITIAL_ALERTS, getUnresolvedAlertsCount, updateAlertStatus } from '../domain/alerts/alertService';
import { INITIAL_CONNECTIONS, syncConnection, disconnectConnection } from '../domain/connections/connectionService';
import { generateCardDetails } from '../utils/cardGenerator';
import { updateUserProfile } from '../lib/firestoreService';
import { signOut, onAuthStateChanged } from '../lib/authService';

// UI Components
import Toast from './ui/Toast';

// Modals & Drawers
import BurnerCardModal from './cards/BurnerCardModal';
import NewCardModal from './cards/NewCardModal';
import CardDetailsDrawer from './cards/CardDetailsDrawer';
import TransactionDetailModal from './transactions/TransactionDetailModal';
import TopUpModal from './modals/TopUpModal';
import SupportChatModal from './chat/SupportChatModal';

// Auth Pages & Admin
import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import FirstTimeCardSetup from './auth/FirstTimeCardSetup';
import AdminDashboard from './admin/AdminDashboard';
import EmailVerificationBanner from './auth/EmailVerificationBanner';
import VerifyEmailModal from './auth/VerifyEmailModal';

// Navigation
import Sidebar from './navigation/Sidebar';
import Header from './navigation/Header';

// Mobile-Dedicated Experience
import MobileHeader from './mobile/MobileHeader';
import MobileBottomNav from './mobile/MobileBottomNav';
import MobileCardDeck from './mobile/MobileCardDeck';
import MobileVaultMenu from './mobile/MobileVaultMenu';

// Tabs
import OverviewTab from './tabs/OverviewTab';
import MyCardsTab from './tabs/MyCardsTab';
import VirtualCardsTab from './tabs/VirtualCardsTab';
import AlertsTab from './tabs/AlertsTab';
import RulesTab from './tabs/RulesTab';
import ConnectionsTab from './tabs/ConnectionsTab';
import CardStudioTab from './tabs/CardStudioTab';
import TransactionsTab from './tabs/TransactionsTab';
import SpendingTab from './tabs/SpendingTab';
import SubscriptionsTab from './tabs/SubscriptionsTab';
import SecurityTab from './tabs/SecurityTab';
import ActivityTab from './tabs/ActivityTab';
import SettingsTab from './tabs/SettingsTab';

// ─── Per-User Storage Helpers ──────────────────────────────────────────────────
// All user data is namespaced by UID so multiple accounts on the same browser
// never bleed into each other.

const DEFAULT_SETTINGS = {
  twoFactor: true,
  loginAlerts: true,
  emailNotifications: true,
  autoFreezeOnFraud: true,
  currency: 'USD ($)',
  sessionTimeout: '30 mins',
};

/** Read the active UID from localStorage — used only for page-refresh hydration */
function getInitialUid() {
  const session = localStorage.getItem('cardhub_session');
  if (!session || session === 'login') return null;
  try {
    const raw = localStorage.getItem('cardhub_current_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.uid || user?.id || null;
  } catch { return null; }
}

/** Load a JSON value from a UID-namespaced key, falling back to `fallback` */
function loadUserData(uid, key, fallback) {
  if (!uid) return fallback;
  try {
    const raw = localStorage.getItem(`cardhub_${key}_${uid}`);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

/** Load wallet balance (stored as plain float string) */
function loadUserBalance(uid) {
  if (!uid) return 0;
  const raw = localStorage.getItem(`cardhub_balance_${uid}`);
  return raw !== null ? parseFloat(raw) : 0;
}

/** Build a live "current session" entry so Security tab always shows real data */
function buildCurrentSession() {
  const ua = navigator.userAgent;
  const browserName =
    ua.includes('Edg') ? 'Edge' :
    ua.includes('Firefox') ? 'Firefox' :
    ua.includes('Chrome') ? 'Chrome' :
    ua.includes('Safari') ? 'Safari' : 'Browser';
  const os =
    ua.includes('Windows') ? 'Windows' :
    ua.includes('Mac') ? 'macOS' :
    ua.includes('Linux') ? 'Linux' :
    ua.includes('Android') ? 'Android' :
    ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : 'Unknown OS';
  return [{
    id: `sess-${Date.now()}`,
    device: 'Current Device (Web App)',
    browser: `${browserName} · ${os}`,
    ip: '—',
    location: 'Active Session',
    lastActive: 'Active right now',
    current: true,
  }];
}
// ──────────────────────────────────────────────────────────────────────────────

export default function Cardhub() {

  // ── Admin / Platform Users (global — for admin panel) ──────────────────────
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('cardhub_users');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return INITIAL_USERS;
  });

  // ── Current Logged-In User Profile ─────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('cardhub_session');
    if (!session || session === 'login') return null;
    const saved = localStorage.getItem('cardhub_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    if (session === 'admin') return INITIAL_USERS[0];
    return null;
  });

  // ── Navigation State ────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(() => {
    const session = localStorage.getItem('cardhub_session');
    if (session === 'admin') return 'admin';
    if (session === 'first-time-setup') return 'first-time-setup';
    if (session === 'paid' || session === 'active' || session === 'logged_in') return 'dashboard';
    return 'login';
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isSectionTransitioning, setIsSectionTransitioning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = useCallback((nextTab) => {
    if (nextTab === activeTab) return;
    setIsSectionTransitioning(true);
    setTimeout(() => {
      setActiveTab(nextTab);
      setIsSectionTransitioning(false);
    }, 140);
  }, [activeTab]);

  // ── Per-User Persistent State (keyed by UID, loaded on page-refresh) ────────
  const _initUid = getInitialUid();

  const [walletBalance, setWalletBalance] = useState(() => loadUserBalance(_initUid));
  const [cards, setCards] = useState(() => {
    const saved = loadUserData(_initUid, 'cards', null);
    return saved !== null ? saved : INITIAL_CARDS;
  });
  const [transactions, setTransactions] = useState(() => loadUserData(_initUid, 'transactions', []));
  const [subscriptions, setSubscriptions] = useState(() => loadUserData(_initUid, 'subscriptions', []));
  const [activityLogs, setActivityLogs] = useState(() => loadUserData(_initUid, 'activity', []));
  const [alerts, setAlerts] = useState(() => loadUserData(_initUid, 'alerts', INITIAL_ALERTS));
  const [rules, setRules] = useState(() => loadUserData(_initUid, 'rules', INITIAL_RULES));
  const [connections, setConnections] = useState(() => loadUserData(_initUid, 'connections', INITIAL_CONNECTIONS));
  const [settings, setSettings] = useState(() => loadUserData(_initUid, 'settings', DEFAULT_SETTINGS));
  const [sessions, setSessions] = useState(() => {
    const session = localStorage.getItem('cardhub_session');
    return (session && session !== 'login') ? buildCurrentSession() : [];
  });

  // Active selected card
  const [activeCardId, setActiveCardId] = useState(() => {
    const initCards = loadUserData(_initUid, 'cards', []);
    return initCards[0]?.id || '';
  });
  const activeCard = cards.find((c) => c.id === activeCardId) || cards[0] || null;

  // Transaction filter (for merchant → transactions navigation)
  const [transactionFilter, setTransactionFilter] = useState('');

  // ── Modals & Drawers ────────────────────────────────────────────────────────
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isBurnerModalOpen, setIsBurnerModalOpen] = useState(false);
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [cardForDetailsDrawer, setCardForDetailsDrawer] = useState(null);
  const [inspectedTransaction, setInspectedTransaction] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // ── Toast Feedback ──────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ id: 0, message: '', type: 'success' });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDataLoaded(true);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const handleStepTransition = (nextStep) => {
    setIsPageTransitioning(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setIsPageTransitioning(false);
    }, 180);
  };

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now() + Math.random(), message, type });
  }, []);

  // ── LocalStorage Sync — ALL writes use UID-namespaced keys ──────────────────
  useEffect(() => {
    localStorage.setItem('cardhub_users', JSON.stringify(users));
  }, [users]);

  // ── Sync Active Firebase Auth State (e.g. Email Verified) ──────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged((fbUser) => {
      if (fbUser && fbUser.emailVerified) {
        setCurrentUser((prev) => {
          if (!prev || prev.emailVerified) return prev;
          const updated = { ...prev, emailVerified: true };
          try {
            localStorage.setItem('cardhub_current_user', JSON.stringify(updated));
            localStorage.setItem(`cardhub_profile_${fbUser.uid}`, JSON.stringify(updated));
          } catch { /* ignore */ }
          return updated;
        });
        const uid = fbUser.uid;
        if (uid && !uid.startsWith('usr-')) {
          updateUserProfile(uid, { emailVerified: true }).catch(() => {});
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cardhub_current_user', JSON.stringify(currentUser));
      const uid = currentUser.uid || currentUser.id;
      if (uid) {
        try {
          localStorage.setItem(`cardhub_profile_${uid}`, JSON.stringify(currentUser));
        } catch { /* ignore */ }
      }
    } else {
      localStorage.removeItem('cardhub_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) return;
    localStorage.setItem(`cardhub_cards_${uid}`, JSON.stringify(cards));
  }, [cards, currentUser]);

  useEffect(() => {
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) return;
    localStorage.setItem(`cardhub_balance_${uid}`, walletBalance.toString());
  }, [walletBalance, currentUser]);

  useEffect(() => {
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) return;
    localStorage.setItem(`cardhub_transactions_${uid}`, JSON.stringify(transactions));
  }, [transactions, currentUser]);

  useEffect(() => {
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) return;
    localStorage.setItem(`cardhub_subscriptions_${uid}`, JSON.stringify(subscriptions));
  }, [subscriptions, currentUser]);

  useEffect(() => {
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) return;
    localStorage.setItem(`cardhub_activity_${uid}`, JSON.stringify(activityLogs));
  }, [activityLogs, currentUser]);

  useEffect(() => {
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) return;
    localStorage.setItem(`cardhub_settings_${uid}`, JSON.stringify(settings));
    if (!uid.startsWith('usr-')) {
      updateUserProfile(uid, { settings }).catch(() => {});
    }
  }, [settings, currentUser]);

  useEffect(() => {
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) return;
    localStorage.setItem(`cardhub_alerts_${uid}`, JSON.stringify(alerts));
  }, [alerts, currentUser]);

  useEffect(() => {
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) return;
    localStorage.setItem(`cardhub_rules_${uid}`, JSON.stringify(rules));
  }, [rules, currentUser]);

  useEffect(() => {
    const uid = currentUser?.uid || currentUser?.id;
    if (!uid) return;
    localStorage.setItem(`cardhub_connections_${uid}`, JSON.stringify(connections));
  }, [connections, currentUser]);

  // ── Activity Logger ─────────────────────────────────────────────────────────
  const logActivity = (title, description, category = 'card', severity = 'info') => {
    const newLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title, description, category, severity,
      timestamp: Date.now(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // ── Load a user's personal data into state (called on every login) ──────────
  const loadUserSession = (uid, profileData = null) => {
    let userCards = loadUserData(uid, 'cards', null);
    if (!userCards) {
      userCards = profileData?.primaryCard ? [profileData.primaryCard] : INITIAL_CARDS;
      try {
        localStorage.setItem(`cardhub_cards_${uid}`, JSON.stringify(userCards));
      } catch { /* ignore */ }
    }
    setCards(userCards);
    setWalletBalance(loadUserBalance(uid));
    setTransactions(loadUserData(uid, 'transactions', []));
    setSubscriptions(loadUserData(uid, 'subscriptions', []));
    setActivityLogs(loadUserData(uid, 'activity', []));
    setAlerts(loadUserData(uid, 'alerts', INITIAL_ALERTS));
    setRules(loadUserData(uid, 'rules', INITIAL_RULES));
    setConnections(loadUserData(uid, 'connections', INITIAL_CONNECTIONS));

    const savedSettings = profileData?.settings || loadUserData(uid, 'settings', DEFAULT_SETTINGS);
    setSettings(savedSettings);

    setSessions(buildCurrentSession());
    setActiveCardId(userCards[0]?.id || '');
  };

  // ── Email Verified Handler ──────────────────────────────────────────────────
  const handleEmailVerified = () => {
    const updatedUser = { ...currentUser, emailVerified: true };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) =>
      (u.id === currentUser?.id || u.email === currentUser?.email) ? updatedUser : u
    ));
    localStorage.setItem('cardhub_current_user', JSON.stringify(updatedUser));
    logActivity('Email Verified', `Account email (${currentUser?.email}) verified.`, 'auth', 'success');
    showToast('Email verified! Full vault privileges unlocked.', 'success');

    const uid = currentUser?.uid || currentUser?.id;
    if (uid && !uid.startsWith('usr-')) {
      updateUserProfile(uid, { emailVerified: true }).catch((err) => {
        console.warn('[Firestore] Profile emailVerified sync notice:', err);
      });
    }
  };

  // ── Authentication Handlers ─────────────────────────────────────────────────

  /**
   * Called by LoginPage after a successful Firebase Auth sign-in.
   * Loads this user's personal data from their UID-scoped storage.
   * BUG-02 FIX: the `user` object coming in already has isFirstLogin resolved
   * correctly by LoginPage (uses cached localStorage profile if Firestore fails).
   */
  const handleLoginSuccess = (user, role = 'customer') => {
    setIsPageTransitioning(true);
    setCurrentUser(user);

    setTimeout(() => {
      if (role === 'admin' || user.role === 'admin') {
        localStorage.setItem('cardhub_session', 'admin');
        setCurrentStep('admin');
        setSessions(buildCurrentSession());
        showToast('Signed in as Administrator');
        logActivity('Admin Session', 'Administrator signed in.', 'auth', 'warning');
        setIsPageTransitioning(false);
        return;
      }

      // Keep admin users list in sync
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === user.id || u.email === user.email);
        return exists
          ? prev.map((u) => (u.id === user.id ? { ...u, ...user } : u))
          : [user, ...prev];
      });

      const uid = user?.uid || user?.id;

      // BUG-01 FIX: Load this specific user's data (other users' data is never touched)
      loadUserSession(uid, user);

      if (user.isFirstLogin) {
        localStorage.setItem('cardhub_session', 'first-time-setup');
        setCurrentStep('first-time-setup');
        showToast(`Welcome, ${user.name}! Set up your first virtual card to continue.`);
        logActivity('Onboarding Started', `${user.name} began first-time card setup.`, 'auth', 'info');
      } else {
        localStorage.setItem('cardhub_session', 'active');
        setCurrentStep('dashboard');
        showToast(`Welcome back, ${user.name}!`);
        logActivity('Session Started', `${user.name} signed in.`, 'auth', 'info');
      }
      setIsPageTransitioning(false);
    }, 200);
  };

  const handleSignupSuccess = (newUser) => {
    setIsPageTransitioning(true);
    setUsers((prev) => {
      const exists = prev.some((u) => u.email === newUser.email);
      return exists ? prev : [newUser, ...prev];
    });
    setCurrentUser(newUser);
    const uid = newUser?.uid || newUser?.id;
    loadUserSession(uid, newUser); // fresh state for new user
    localStorage.setItem('cardhub_session', 'first-time-setup');
    setTimeout(() => {
      setCurrentStep('first-time-setup');
      logActivity('New Account', `Account created for "${newUser.name}" (${newUser.email}).`, 'auth', 'info');
      showToast('Account created! Set up your first card to get started.');
      setIsPageTransitioning(false);
    }, 200);
  };

  const handleFirstTimeSetupComplete = (newCard) => {
    // 1. Prepend card and set as active
    setCards((prev) => [newCard, ...prev]);
    setActiveCardId(newCard.id);

    // 2. Mark onboarding complete
    const updatedUser = {
      ...currentUser,
      isFirstLogin: false,
      cardCount: (currentUser?.cardCount || 0) + 1,
      primaryCard: newCard,
      status: 'active',
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) =>
      (u.id === currentUser?.id || u.email === currentUser?.email) ? updatedUser : u
    ));

    // 3. Persist and navigate with transition
    localStorage.setItem('cardhub_session', 'active');
    localStorage.setItem('cardhub_current_user', JSON.stringify(updatedUser));
    handleStepTransition('dashboard');

    logActivity(
      'Card Activated',
      `"${newCard.label}" (${newCard.brand} ···${newCard.last4}) activated.`,
      'card', 'success'
    );
    showToast(`Card "${newCard.label}" issued! Welcome to CardHub.`);

    // 4. Non-blocking Firestore sync
    const uid = currentUser?.uid || currentUser?.id;
    if (uid && !uid.startsWith('usr-')) {
      updateUserProfile(uid, {
        isFirstLogin: false,
        cardCount: updatedUser.cardCount,
        primaryCard: newCard,
        status: 'active',
      }).catch((err) => {
        console.warn('[Firestore] Background profile sync notice:', err);
      });
    }
  };

  const handleSkipFirstTimeSetup = () => {
    const updatedUser = {
      ...currentUser,
      isFirstLogin: false,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('cardhub_session', 'active');
    localStorage.setItem('cardhub_current_user', JSON.stringify(updatedUser));
    const uid = updatedUser.uid || updatedUser.id;
    if (uid) {
      try {
        localStorage.setItem(`cardhub_profile_${uid}`, JSON.stringify(updatedUser));
      } catch { /* ignore */ }
      if (!uid.startsWith('usr-')) {
        updateUserProfile(uid, { isFirstLogin: false }).catch(() => {});
      }
    }
    handleStepTransition('dashboard');
    showToast('Setup skipped. You can issue cards anytime from the dashboard.');
  };

  /**
   * BUG-09 FIX: Proper logout — calls Firebase signOut, then resets ALL in-memory
   * state so the next user (or the same user logging back in) starts clean.
   */
  const handleLogout = async () => {
    setIsPageTransitioning(true);
    try {
      await signOut();
    } catch (err) {
      console.warn('[CardHub] Firebase sign-out notice:', err);
    }

    setTimeout(() => {
      localStorage.removeItem('cardhub_session');
      localStorage.removeItem('cardhub_current_user');

      // Reset all per-user state
      setCurrentUser(null);
      setCards([]);
      setWalletBalance(0);
      setTransactions([]);
      setSubscriptions([]);
      setActivityLogs([]);
      setSettings(DEFAULT_SETTINGS);
      setSessions([]);
      setActiveCardId('');
      setTransactionFilter('');

      setCurrentStep('login');
      setActiveTab('overview');
      showToast('Session locked and signed out', 'info');
      setIsPageTransitioning(false);
    }, 200);
  };

  // ── Admin Handlers ──────────────────────────────────────────────────────────
  const handleSimulateNewCustomer = () => {
    const demoNames = [
      { name: 'Julian Thorne', email: 'julian.t@nexusvault.io', phone: '+1 (555) 789-0123', city: 'Denver, CO, USA' },
      { name: 'Amira Patel', email: 'amira.p@fintechscale.com', phone: '+44 20 8912 3456', city: 'Manchester, UK' },
      { name: 'Lucas Meyer', email: 'lucas.m@berlintech.de', phone: '+49 30 1234 5678', city: 'Berlin, Germany' },
    ];
    const pick = demoNames[Math.floor(Math.random() * demoNames.length)];
    const cardDigits = generateCardDetails('VISA');
    const last4 = cardDigits.cardNumber.slice(-4);

    const simulatedUser = {
      id: `usr-${Date.now()}`,
      name: pick.name,
      email: pick.email,
      phone: pick.phone,
      address: 'Simulated customer residence',
      cityState: pick.city,
      zipCode: '80202',
      role: 'customer',
      status: 'active',
      isFirstLogin: false,
      createdAt: Date.now(),
      cardCount: 1,
      primaryCard: {
        id: `card-${Date.now()}`,
        label: 'Primary Corporate Vault Card',
        brand: 'VISA',
        last4,
        maskedNumber: `•••• •••• •••• ${last4}`,
        monthlyLimit: 3500,
        expDate: cardDigits.expDate,
        cardHolderName: pick.name.toUpperCase(),
        billingZip: '80202',
        createdAt: Date.now(),
      },
    };

    setUsers((prev) => [simulatedUser, ...prev]);
    logActivity('New Customer Onboarded', `Customer "${pick.name}" registered and completed onboarding.`, 'auth', 'info');
    showToast(`Customer "${pick.name}" onboarded successfully.`);
  };

  const handleUpdateUser = (userId, updatedFields) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...updatedFields } : u));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updatedFields }));
    }
    const uid = userId;
    if (uid && !uid.startsWith('usr-')) {
      updateUserProfile(uid, updatedFields).catch((err) =>
        console.warn('Firestore user update sync failed:', err)
      );
    }
    showToast('Customer record updated successfully.');
  };

  const handleDeleteUser = (userId) => {
    const userToDelete = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast(`Customer account "${userToDelete?.name || 'User'}" purged.`, 'info');
    logActivity('Customer Purged', `Administrator removed customer account ${userToDelete?.name}.`, 'security', 'warning');
  };

  const handleGoToAdmin = () => {
    localStorage.setItem('cardhub_session', 'admin');
    setCurrentStep('admin');
    showToast('Switched to Admin Dashboard');
  };

  const handleSwitchToCustomerView = () => {
    localStorage.setItem('cardhub_session', 'active');
    setCurrentStep('dashboard');
    showToast('Switched to Customer View');
  };

  // ── Clipboard ───────────────────────────────────────────────────────────────
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  };

  // ── Card Operations ─────────────────────────────────────────────────────────
  const handleCreateCard = (newCard) => {
    setCards((prev) => [newCard, ...prev]);
    setActiveCardId(newCard.id);
    showToast(`${newCard.label} successfully issued!`, 'success');
    logActivity(
      newCard.isBurner ? 'Disposable Burner Card Issued' : 'Virtual Card Issued',
      `Issued "${newCard.label}" (${newCard.brand}) with limit of $${newCard.monthlyLimit}.`,
      'card', newCard.isBurner ? 'warning' : 'info'
    );
  };

  const handleUpdateCard = (cardId, updatedFields) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const updated = { ...c, ...updatedFields };

        if (updatedFields.isLocked !== undefined && updatedFields.isLocked !== c.isLocked) {
          logActivity(
            updatedFields.isLocked ? 'Card Frozen' : 'Card Unfrozen',
            `"${c.label}" authorization status updated to ${updatedFields.isLocked ? 'FROZEN' : 'ACTIVE'}.`,
            'security', updatedFields.isLocked ? 'warning' : 'success'
          );
          showToast(updatedFields.isLocked ? `Card "${c.label}" is now frozen.` : `Card "${c.label}" is now active.`);
        } else if (updatedFields.monthlyLimit && updatedFields.monthlyLimit !== c.monthlyLimit) {
          logActivity('Spend Limit Modified', `Monthly limit on "${c.label}" adjusted to $${updatedFields.monthlyLimit}.`, 'card', 'info');
          showToast(`Monthly limit on "${c.label}" updated to $${updatedFields.monthlyLimit}.`);
        } else if (updatedFields.isBurned && !c.isBurned) {
          logActivity('Burner Card Destroyed', `Burner token on "${c.label}" permanently burned and destroyed.`, 'security', 'warning');
          showToast(`Burner token "${c.label}" destroyed!`, 'info');
        } else {
          showToast(`Updated "${c.label}" details.`);
        }

        return updated;
      })
    );

    if (cardForDetailsDrawer && cardForDetailsDrawer.id === cardId) {
      setCardForDetailsDrawer((prev) => ({ ...prev, ...updatedFields }));
    }
  };

  /**
   * BUG-10 FIX: Compute the fallback active card from the filtered array
   * (not from the stale `cards` state) to avoid picking the deleted card.
   */
  const handleDeleteCard = (cardId) => {
    const cardToDelete = cards.find((c) => c.id === cardId);
    const remainingCards = cards.filter((c) => c.id !== cardId);
    setCards(remainingCards);
    if (activeCardId === cardId) {
      setActiveCardId(remainingCards[0]?.id || '');
    }
    showToast(`Card "${cardToDelete?.label || 'Virtual Card'}" terminated.`, 'info');
    logActivity(
      'Card Terminated',
      `Card "${cardToDelete?.label}" and all linked tokens were permanently deleted.`,
      'card', 'warning'
    );
  };

  // ── Emergency Panic Freeze All (Virtual cards only) ────────────────────────
  const virtualCards = cards.filter((c) => c.source !== 'bank_connection');
  const allCardsFrozen = virtualCards.length > 0 && virtualCards.every((c) => c.isLocked);

  const handlePanicFreezeAll = () => {
    const newFreezeState = !allCardsFrozen;
    setCards((prev) =>
      prev.map((c) => (c.source === 'bank_connection' ? c : { ...c, isLocked: newFreezeState }))
    );
    logActivity(
      newFreezeState ? 'PANIC FREEZE: Virtual Cards Locked' : 'PANIC OVERRIDE: Virtual Cards Reactivated',
      newFreezeState
        ? 'Emergency authorization kill-switch engaged across all CardHub virtual cards.'
        : 'Virtual cards restored to active status.',
      'security', newFreezeState ? 'danger' : 'success'
    );
    showToast(
      newFreezeState
        ? 'All virtual cards are now FROZEN. (Linked bank cards must be frozen via your bank app).'
        : 'All virtual cards have been reactivated.',
      newFreezeState ? 'error' : 'success'
    );
  };

  // ── Alerts, Rules & Connections Handlers ───────────────────────────────────
  const handleUpdateAlertStatus = (alertId, newStatus) => {
    setAlerts((prev) => updateAlertStatus(prev, alertId, newStatus));
    logActivity('Alert Updated', `Alert #${alertId} marked as ${newStatus}.`, 'security', 'info');
    showToast(`Alert updated to ${newStatus}.`, 'info');
  };

  const handleAddRule = (newRule) => {
    setRules((prev) => [newRule, ...prev]);
    logActivity('Spending Rule Added', `Added rule "${newRule.name}" (${newRule.enforcementMode}).`, 'security', 'info');
  };

  const handleToggleRule = (ruleId) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        const next = !r.enabled;
        logActivity('Rule Toggled', `Rule "${r.name}" ${next ? 'enabled' : 'paused'}.`, 'security', 'info');
        showToast(`Rule "${r.name}" ${next ? 'enabled' : 'paused'}.`);
        return { ...r, enabled: next };
      })
    );
  };

  const handleSyncConnection = (connId) => {
    setConnections((prev) => syncConnection(prev, connId));
    logActivity('Provider Synced', `Financial provider connection #${connId} synchronized.`, 'auth', 'info');
  };

  const handleDisconnectConnection = (connId) => {
    setConnections((prev) => disconnectConnection(prev, connId));
    logActivity('Provider Disconnected', `Financial connection #${connId} disconnected.`, 'auth', 'warning');
  };

  // ── Top Up ──────────────────────────────────────────────────────────────────
  const handleTopUpSuccess = (amount, channel) => {
    setWalletBalance((prev) => prev + amount);
    const newTx = {
      id: `tx-${Date.now()}`,
      merchant: `Wallet Deposit (${channel.toUpperCase()})`,
      category: 'Deposit',
      amount,
      date: 'Just Now',
      rawDate: new Date().toISOString(),
      status: 'Completed',
      type: 'credit',
      cardId: activeCard?.id || '',
      cardName: activeCard?.label || 'Primary Card',
      location: 'Instant Bank Gateway',
      channel: `${channel.toUpperCase()} Instant Credit`,
      authCode: `DEP-${Math.floor(10000 + Math.random() * 90000)}`,
      mcc: '6012 - Financial Deposit',
      notes: `Instant deposit credited to CardHub wallet balance via ${channel}.`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    logActivity('Wallet Funded', `+$${amount.toFixed(2)} deposited into CardHub wallet via ${channel}.`, 'transaction', 'success');
    showToast(`Successfully deposited $${amount.toFixed(2)} to wallet!`, 'success');
  };

  // ── Transaction Dispute ────────────────────────────────────────────────────
  const handleDisputeTransaction = (transaction) => {
    logActivity(
      'Transaction Disputed',
      `Flagged authorization #${transaction.authCode || transaction.id} at "${transaction.merchant}" for investigation.`,
      'security', 'warning'
    );
    showToast(`Dispute opened for ${transaction.merchant}. Security team notified.`, 'info');
    setInspectedTransaction(null);
  };

  // ── Session Revocation ─────────────────────────────────────────────────────
  const handleRevokeSession = (sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    logActivity('Hardware Session Revoked', `Remote token for session #${sessionId} was invalidated.`, 'auth', 'warning');
    showToast('Device session revoked immediately.', 'info');
  };

  // ── BUG-14 FIX: Merchant filter properly wires to TransactionsTab ───────────
  const handleFilterMerchantHistory = (merchantName) => {
    setTransactionFilter(merchantName);
    setActiveTab('transactions');
    showToast(`Showing transactions for ${merchantName}`, 'info');
  };

  // ── BUG-16 FIX: Reset data requires confirmation ───────────────────────────
  const handleResetData = () => {
    const confirmed = window.confirm(
      'This will permanently erase all your cards, transactions, and spending data. This cannot be undone.\n\nContinue?'
    );
    if (!confirmed) return;

    const uid = currentUser?.uid || currentUser?.id;
    if (uid) {
      localStorage.removeItem(`cardhub_cards_${uid}`);
      localStorage.removeItem(`cardhub_balance_${uid}`);
      localStorage.removeItem(`cardhub_transactions_${uid}`);
      localStorage.removeItem(`cardhub_subscriptions_${uid}`);
      localStorage.removeItem(`cardhub_activity_${uid}`);
      localStorage.removeItem(`cardhub_settings_${uid}`);
      localStorage.removeItem(`cardhub_alerts_${uid}`);
      localStorage.removeItem(`cardhub_rules_${uid}`);
      localStorage.removeItem(`cardhub_connections_${uid}`);
    }
    setCards([]);
    setWalletBalance(0);
    setTransactions([]);
    setSubscriptions([]);
    setActivityLogs([]);
    setAlerts(INITIAL_ALERTS);
    setRules(INITIAL_RULES);
    setConnections(INITIAL_CONNECTIONS);
    setActiveCardId('');
    showToast('All personal data cleared.', 'info');
  };

  // ── BUG-04 FIX: Export uses the current logged-in user's real info ──────────
  const handleExportAllData = () => {
    const nameParts = (currentUser?.name || 'CardHub User').split(' ');
    const backupData = {
      user: {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: currentUser?.email || '',
        uid: currentUser?.uid || currentUser?.id || '',
      },
      balance: walletBalance,
      cards,
      transactions,
      subscriptions,
      activityLogs,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cardhub_vault_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Vault backup JSON exported successfully!', 'success');
  };

  // ── Step: Signup ────────────────────────────────────────────────────────────
  if (currentStep === 'signup') {
    return (
      <div className={`min-h-screen w-full bg-[#000000] ${isPageTransitioning ? 'animate-screen-exit' : 'animate-screen-enter'}`}>
        <Toast
          key={toast.id || 'toast-signup'}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ id: 0, message: '', type: 'success' })}
        />
        <SignupPage
          onSignupSuccess={handleSignupSuccess}
          onGoToLogin={() => handleStepTransition('login')}
          onGoToAdminLogin={() => {
            localStorage.setItem('cardhub_session', 'admin');
            handleStepTransition('admin');
          }}
        />
      </div>
    );
  }

  // ── Step: Login ─────────────────────────────────────────────────────────────
  if (currentStep === 'login') {
    return (
      <div className={`min-h-screen w-full bg-[#000000] ${isPageTransitioning ? 'animate-screen-exit' : 'animate-screen-enter'}`}>
        <Toast
          key={toast.id || 'toast-login'}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ id: 0, message: '', type: 'success' })}
        />
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onGoToSignup={() => handleStepTransition('signup')}
          onDirectAdminLogin={() => {
            localStorage.setItem('cardhub_session', 'admin');
            handleStepTransition('admin');
          }}
          registeredUsers={users}
        />
      </div>
    );
  }

  // ── Step: First-Time Card Setup ─────────────────────────────────────────────
  if (currentStep === 'first-time-setup') {
    return (
      <div className={`min-h-screen w-full bg-[#000000] ${isPageTransitioning ? 'animate-screen-exit' : 'animate-screen-enter'}`}>
        <Toast
          key={toast.id || 'toast-setup'}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ id: 0, message: '', type: 'success' })}
        />
        <FirstTimeCardSetup
          user={currentUser}
          onCompleteSetup={handleFirstTimeSetupComplete}
          onSkipSetup={handleSkipFirstTimeSetup}
        />
      </div>
    );
  }

  // ── Step: Admin Dashboard ───────────────────────────────────────────────────
  if (currentStep === 'admin') {
    return (
      <div className={`min-h-screen w-full bg-[#000000] ${isPageTransitioning ? 'animate-screen-exit' : 'animate-screen-enter'}`}>
        <Toast
          key={toast.id || 'toast-admin'}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ id: 0, message: '', type: 'success' })}
        />
        <AdminDashboard
          users={users}
          cards={cards}
          activityLogs={activityLogs}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onSimulateNewCustomer={handleSimulateNewCustomer}
          onSwitchToCustomerView={handleSwitchToCustomerView}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // ── Main Dashboard ──────────────────────────────────────────────────────────
  return (
    <div className={`min-h-[100dvh] md:h-screen w-full md:overflow-hidden bg-[#000000] text-[#F5F5F7] font-sans antialiased selection:bg-[#0A84FF] selection:text-white ${isPageTransitioning ? 'animate-screen-exit' : 'animate-screen-enter'}`}>
      {/* Toast Alert Feed */}
      <Toast
        key={toast.id || 'toast-main'}
        id={toast.id}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ id: 0, message: '', type: 'success' })}
      />

      {/* Global Modals & Drawers */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onTopUpSuccess={handleTopUpSuccess}
      />

      <BurnerCardModal
        isOpen={isBurnerModalOpen}
        onClose={() => setIsBurnerModalOpen(false)}
        onCardCreated={handleCreateCard}
        activeUser={activeCard}
      />

      <NewCardModal
        isOpen={isNewCardModalOpen}
        onClose={() => setIsNewCardModalOpen(false)}
        onCardCreated={handleCreateCard}
        activeUser={activeCard}
      />

      <CardDetailsDrawer
        isOpen={!!cardForDetailsDrawer}
        onClose={() => setCardForDetailsDrawer(null)}
        card={cardForDetailsDrawer}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
        onCopy={handleCopy}
      />

      <TransactionDetailModal
        isOpen={!!inspectedTransaction}
        onClose={() => setInspectedTransaction(null)}
        transaction={inspectedTransaction}
        onDispute={handleDisputeTransaction}
        onFreezeCard={(cId) => handleUpdateCard(cId, { isLocked: true })}
      />

      <SupportChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        cards={cards}
        walletBalance={walletBalance}
      />

      {/* Email Verification Modal */}
      <VerifyEmailModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        currentUser={currentUser}
        onEmailVerified={handleEmailVerified}
        showToast={showToast}
      />

      {/* ── Mobile Layout (< md) ── */}
      <div className="md:hidden fixed inset-0 h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-[#000000] z-0">
        {/* Sticky Mobile Header (Permanently pinned at top) */}
        <div className="shrink-0 z-30">
          <MobileHeader
            activeTab={activeTab}
            walletBalance={walletBalance}
            openAlertsCount={getUnresolvedAlertsCount(alerts)}
            onOpenTopUp={() => setIsTopUpOpen(true)}
            onPanicFreezeAll={handlePanicFreezeAll}
            allCardsFrozen={allCardsFrozen}
            onNavigateTab={handleTabChange}
          />

          <EmailVerificationBanner
            currentUser={currentUser}
            onEmailVerified={handleEmailVerified}
            showToast={showToast}
          />
        </div>

        {/* Scrollable Viewport (THE ONLY ELEMENT THAT SCROLLS ON PHONE) */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-24">
          <div
            key={activeTab}
            className={`w-full ${isSectionTransitioning ? 'animate-section-exit' : 'animate-section-enter'}`}
          >
            {/* Main Card-First Hero if on overview or cards */}
            {(activeTab === 'overview' || activeTab === 'my-cards' || activeTab === 'virtual-cards') && (
              <MobileCardDeck
                cards={cards}
                activeCardId={activeCardId}
                setActiveCardId={setActiveCardId}
                walletBalance={walletBalance}
                transactions={transactions}
                onOpenNewCard={() => setIsNewCardModalOpen(true)}
                onOpenBurnerCard={() => setIsBurnerModalOpen(true)}
                onOpenTopUp={() => setIsTopUpOpen(true)}
                onUpdateCard={handleUpdateCard}
                onSelectTransaction={(tx) => setInspectedTransaction(tx)}
                onNavigateTab={handleTabChange}
                onCopy={handleCopy}
                onOpenCardDetails={(card) => setCardForDetailsDrawer(card)}
              />
            )}

            {activeTab === 'vault-menu' && (
              <MobileVaultMenu
                onNavigateTab={handleTabChange}
                openAlertsCount={getUnresolvedAlertsCount(alerts)}
                currentUser={currentUser}
                onGoToAdmin={handleGoToAdmin}
                onLogout={handleLogout}
              />
            )}

            {activeTab === 'transactions' && (
              <div className="p-4">
                <TransactionsTab
                  transactions={transactions}
                  cards={cards}
                  onSelectTransaction={(tx) => setInspectedTransaction(tx)}
                  initialFilter={transactionFilter}
                  onFilterCleared={() => setTransactionFilter('')}
                  isLoading={!isDataLoaded}
                />
              </div>
            )}

            {/* Shield Hub: Segmented Rules & Alerts Switcher */}
            {(activeTab === 'rules' || activeTab === 'alerts') && (
              <div className="p-4 space-y-4">
                <div className="flex rounded-[10px] bg-[#1C1C1E] border border-[#38383A] p-1 shadow-xs">
                  <button
                    onClick={() => handleTabChange('rules')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-[8px] transition active:scale-[0.98] ${
                      activeTab === 'rules'
                        ? 'bg-[#0A84FF] text-white shadow-xs'
                        : 'text-[#8E8E93] hover:text-[#F5F5F7]'
                    }`}
                  >
                    Rules & Limits
                  </button>
                  <button
                    onClick={() => handleTabChange('alerts')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-[8px] transition active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                      activeTab === 'alerts'
                        ? 'bg-[#FF453A] text-white shadow-xs'
                        : 'text-[#8E8E93] hover:text-[#F5F5F7]'
                    }`}
                  >
                    <span>Security Alerts</span>
                    {getUnresolvedAlertsCount(alerts) > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                        activeTab === 'alerts' ? 'bg-white text-[#FF453A]' : 'bg-[#FF453A] text-white'
                      }`}>
                        {getUnresolvedAlertsCount(alerts)}
                      </span>
                    )}
                  </button>
                </div>

                {activeTab === 'rules' ? (
                  <RulesTab
                    rules={rules}
                    cards={cards}
                    transactions={transactions}
                    onAddRule={handleAddRule}
                    onToggleRule={handleToggleRule}
                    showToast={showToast}
                  />
                ) : (
                  <AlertsTab
                    alerts={alerts}
                    cards={cards}
                    onUpdateAlertStatus={handleUpdateAlertStatus}
                    onFreezeCard={(cId) => handleUpdateCard(cId, { isLocked: true })}
                    onNavigateTab={handleTabChange}
                    isLoading={!isDataLoaded}
                  />
                )}
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="p-4">
                <ConnectionsTab
                  connections={connections}
                  onSyncConnection={handleSyncConnection}
                  onDisconnectConnection={handleDisconnectConnection}
                  showToast={showToast}
                  isLoading={!isDataLoaded}
                />
              </div>
            )}

            {activeTab === 'customizer' && (
              <div className="p-4">
                <CardStudioTab
                  activeCard={activeCard}
                  onUpdateActiveCard={(fields) => activeCard && handleUpdateCard(activeCard.id, fields)}
                  onCopy={handleCopy}
                />
              </div>
            )}

            {activeTab === 'spending' && (
              <div className="p-4">
                <SpendingTab
                  transactions={transactions}
                  cards={cards}
                  isLoading={!isDataLoaded}
                />
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="p-4">
                <SubscriptionsTab
                  subscriptions={subscriptions}
                  cards={cards}
                  onFreezeCard={(cId) => handleUpdateCard(cId, { isLocked: true })}
                  onOpenBurnerCard={() => setIsBurnerModalOpen(true)}
                  onFilterMerchantHistory={handleFilterMerchantHistory}
                  isLoading={!isDataLoaded}
                />
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-4">
                <SecurityTab
                  cards={cards}
                  sessions={sessions}
                  settings={settings}
                  currentUser={currentUser}
                  onOpenVerifyEmail={() => setIsVerifyModalOpen(true)}
                  onUpdateSettings={(newFields) => setSettings((prev) => ({ ...prev, ...newFields }))}
                  onPanicFreezeAll={handlePanicFreezeAll}
                  allCardsFrozen={allCardsFrozen}
                  onRevokeSession={handleRevokeSession}
                  onUnfreezeCard={(cId) => handleUpdateCard(cId, { isLocked: false })}
                  isLoading={!isDataLoaded}
                />
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="p-4">
                <ActivityTab activityLogs={activityLogs} isLoading={!isDataLoaded} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-4">
                <SettingsTab
                  user={activeCard}
                  currentUser={currentUser}
                  onOpenVerifyEmail={() => setIsVerifyModalOpen(true)}
                  settings={settings}
                  onUpdateSettings={(newFields) => setSettings((prev) => ({ ...prev, ...newFields }))}
                  onResetData={handleResetData}
                  onExportAllData={handleExportAllData}
                  isLoading={!isDataLoaded}
                />
              </div>
            )}
          </div>
        </div>

        {/* Fixed Mobile Bottom Navigation (Permanently locked to bottom) */}
        <div className="shrink-0 z-40">
          <MobileBottomNav
            activeTab={activeTab}
            onNavigateTab={handleTabChange}
            openAlertsCount={getUnresolvedAlertsCount(alerts)}
          />
        </div>
      </div>

      {/* ── Desktop Layout (md and up) ── */}
      <div className="hidden md:flex flex-row h-screen w-full overflow-hidden">
        {/* Primary Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab === 'vault-menu' ? 'overview' : activeTab}
          setActiveTab={handleTabChange}
          cardCount={cards.length}
          openAlertsCount={getUnresolvedAlertsCount(alerts)}
          onLogout={handleLogout}
          isOpenMobile={isMobileMenuOpen}
          setIsOpenMobile={setIsMobileMenuOpen}
          currentUser={currentUser}
          onGoToAdmin={handleGoToAdmin}
          onOpenVerifyEmail={() => setIsVerifyModalOpen(true)}
        />

        {/* Main Command Workspace */}
        <main className="flex-1 h-screen overflow-y-auto p-5 sm:p-8 lg:p-10 w-full max-w-7xl mx-auto flex flex-col">
          {/* Top Header */}
          <Header
            activeTab={activeTab === 'vault-menu' ? 'overview' : activeTab}
            currentUser={currentUser}
            walletBalance={walletBalance}
            openAlertsCount={getUnresolvedAlertsCount(alerts)}
            onOpenTopUp={() => setIsTopUpOpen(true)}
            onOpenChat={() => setIsChatOpen(true)}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onPanicFreezeAll={handlePanicFreezeAll}
            allCardsFrozen={allCardsFrozen}
            onGoToAdmin={handleGoToAdmin}
            onNavigateTab={handleTabChange}
          />

          {/* Security Email Verification Notice Banner */}
          <EmailVerificationBanner
            currentUser={currentUser}
            onEmailVerified={handleEmailVerified}
            showToast={showToast}
          />

          {/* Section Container with subtle enter/exit animations */}
          <div
            key={activeTab}
            className={`w-full flex-1 flex flex-col ${isSectionTransitioning ? 'animate-section-exit' : 'animate-section-enter'}`}
          >
            {/* Tab 1: Command Center Overview */}
            {(activeTab === 'overview' || activeTab === 'vault-menu') && (
              <OverviewTab
                cards={cards}
                activeCardId={activeCardId}
                setActiveCardId={setActiveCardId}
                walletBalance={walletBalance}
                transactions={transactions}
                subscriptions={subscriptions}
                alerts={alerts}
                onOpenNewCard={() => setIsNewCardModalOpen(true)}
                onOpenBurnerCard={() => setIsBurnerModalOpen(true)}
                onOpenTopUp={() => setIsTopUpOpen(true)}
                onUpdateCard={handleUpdateCard}
                onSelectTransaction={(tx) => setInspectedTransaction(tx)}
                onNavigateTab={handleTabChange}
                onCopy={handleCopy}
                isLoading={!isDataLoaded}
              />
            )}

            {/* Tab 2: My Cards (Full Inventory: Bank + Virtual + Demo) */}
            {activeTab === 'my-cards' && (
              <MyCardsTab
                cards={cards}
                onSelectCardDetails={(card) => setCardForDetailsDrawer(card)}
                onUpdateCard={handleUpdateCard}
                onNavigateTab={handleTabChange}
                showToast={showToast}
                isLoading={!isDataLoaded}
              />
            )}

            {/* Tab 3: Virtual Cards (Dedicated Exposure Protection & Burners) */}
            {(activeTab === 'virtual-cards' || activeTab === 'cards') && (
              <VirtualCardsTab
                cards={cards}
                onOpenNewCard={() => setIsNewCardModalOpen(true)}
                onOpenBurnerCard={() => setIsBurnerModalOpen(true)}
                onSelectCardDetails={(card) => setCardForDetailsDrawer(card)}
                onUpdateCard={handleUpdateCard}
                showToast={showToast}
                isLoading={!isDataLoaded}
              />
            )}

            {/* Tab 4: Transaction & Activity Ledger */}
            {activeTab === 'transactions' && (
              <TransactionsTab
                transactions={transactions}
                cards={cards}
                onSelectTransaction={(tx) => setInspectedTransaction(tx)}
                initialFilter={transactionFilter}
                onFilterCleared={() => setTransactionFilter('')}
                isLoading={!isDataLoaded}
              />
            )}

            {/* Tab 5: Security & Risk Alerts */}
            {activeTab === 'alerts' && (
              <AlertsTab
                alerts={alerts}
                cards={cards}
                onUpdateAlertStatus={handleUpdateAlertStatus}
                onFreezeCard={(cId) => handleUpdateCard(cId, { isLocked: true })}
                onNavigateTab={handleTabChange}
                isLoading={!isDataLoaded}
              />
            )}

            {/* Tab 6: Spending Rules & Transaction Simulator */}
            {activeTab === 'rules' && (
              <RulesTab
                rules={rules}
                cards={cards}
                transactions={transactions}
                onAddRule={handleAddRule}
                onToggleRule={handleToggleRule}
                showToast={showToast}
              />
            )}

            {/* Tab 7: Financial Provider Connections */}
            {activeTab === 'connections' && (
              <ConnectionsTab
                connections={connections}
                onSyncConnection={handleSyncConnection}
                onDisconnectConnection={handleDisconnectConnection}
                showToast={showToast}
                isLoading={!isDataLoaded}
              />
            )}

            {/* Tab 8: Card Studio Customizer */}
            {activeTab === 'customizer' && (
              <CardStudioTab
                activeCard={activeCard}
                onUpdateActiveCard={(fields) => activeCard && handleUpdateCard(activeCard.id, fields)}
                onCopy={handleCopy}
              />
            )}

            {/* Tab 9: Spending Insights */}
            {activeTab === 'spending' && (
              <SpendingTab
                transactions={transactions}
                cards={cards}
                isLoading={!isDataLoaded}
              />
            )}

            {/* Tab 10: Subscription Intelligence */}
            {activeTab === 'subscriptions' && (
              <SubscriptionsTab
                subscriptions={subscriptions}
                cards={cards}
                onFreezeCard={(cId) => handleUpdateCard(cId, { isLocked: true })}
                onOpenBurnerCard={() => setIsBurnerModalOpen(true)}
                onFilterMerchantHistory={handleFilterMerchantHistory}
                isLoading={!isDataLoaded}
              />
            )}

            {/* Tab 11: Security Console */}
            {activeTab === 'security' && (
              <SecurityTab
                cards={cards}
                sessions={sessions}
                settings={settings}
                currentUser={currentUser}
                onOpenVerifyEmail={() => setIsVerifyModalOpen(true)}
                onUpdateSettings={(newFields) => setSettings((prev) => ({ ...prev, ...newFields }))}
                onPanicFreezeAll={handlePanicFreezeAll}
                allCardsFrozen={allCardsFrozen}
                onRevokeSession={handleRevokeSession}
                onUnfreezeCard={(cId) => handleUpdateCard(cId, { isLocked: false })}
                isLoading={!isDataLoaded}
              />
            )}

            {/* Tab 12: Activity Timeline */}
            {activeTab === 'activity' && (
              <ActivityTab activityLogs={activityLogs} isLoading={!isDataLoaded} />
            )}

            {/* Tab 13: Account & Platform Settings */}
            {activeTab === 'settings' && (
              <SettingsTab
                user={activeCard}
                currentUser={currentUser}
                onOpenVerifyEmail={() => setIsVerifyModalOpen(true)}
                settings={settings}
                onUpdateSettings={(newFields) => setSettings((prev) => ({ ...prev, ...newFields }))}
                onResetData={handleResetData}
                onExportAllData={handleExportAllData}
                isLoading={!isDataLoaded}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
