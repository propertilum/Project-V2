import { useState, useEffect } from 'react';
import { signInWithEmail, getAuthErrorMessage, onAuthStateChanged, signOut } from '../lib/authService';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';
import Toast from '../components/ui/Toast';

export default function AdminApp() {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3800);
  };

  // Check for existing admin session on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user && user.email === 'admin@cardhub.io') {
        // Admin session exists, fetch profile
        setAdminUser({
          id: 'usr-admin',
          name: 'Platform Administrator',
          email: 'admin@cardhub.io',
          role: 'admin',
          uid: user.uid,
        });
      } else {
        setAdminUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdminLogin = async (email, password) => {
    if (email !== 'admin@cardhub.io') {
      throw new Error('Access denied. Administrator credentials required.');
    }

    try {
      const credential = await signInWithEmail(email, password);
      const adminUserData = {
        id: 'usr-admin',
        name: 'Platform Administrator',
        email: 'admin@cardhub.io',
        role: 'admin',
        uid: credential.user.uid,
      };
      setAdminUser(adminUserData);
      showToast('Signed in as Administrator');
      return adminUserData;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error), { cause: error });
    }
  };

  const handleAdminLogout = async () => {
    await signOut();
    setAdminUser(null);
    showToast('Signed out', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      
      {adminUser ? (
        <AdminDashboard
          adminUser={adminUser}
          onLogout={handleAdminLogout}
          showToast={showToast}
        />
      ) : (
        <AdminLoginPage onLogin={handleAdminLogin} />
      )}
    </div>
  );
}
