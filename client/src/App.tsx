import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { AnimeDetailPage } from './pages/AnimeDetailPage';
import { WatchPage } from './pages/WatchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PointShopPage } from './pages/PointShopPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import type { User } from './types/anime';

// 7 Days in milliseconds = 7 * 24 * 60 * 60 * 1000 = 604,800,000 ms
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedExpiry = localStorage.getItem('loginExpiryTimestamp');
      if (savedUser && savedExpiry) {
        const expiryTimestamp = parseInt(savedExpiry, 10);
        if (Date.now() < expiryTimestamp) {
          return JSON.parse(savedUser);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved user', e);
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Restore & Check 7-day session expiration
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedExpiry = localStorage.getItem('loginExpiryTimestamp');

    if (savedUser && savedExpiry) {
      const expiryTimestamp = parseInt(savedExpiry, 10);
      const now = Date.now();

      if (now >= expiryTimestamp) {
        // Session expired after 7 days -> Auto logout
        handleLogout();
        setIsAuthModalOpen(true);
      }
    } else if (!savedUser) {
      // Chưa đăng nhập -> Tự động bật Modal Đăng Nhập khi tải lại trang / truy cập lần đầu
      setIsAuthModalOpen(true);
    }
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    const expiryTimestamp = Date.now() + SEVEN_DAYS_MS;

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', userData.accessToken);
    if (userData.refreshToken) {
      localStorage.setItem('refreshToken', userData.refreshToken);
    }
    localStorage.setItem('loginExpiryTimestamp', expiryTimestamp.toString());
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('loginExpiryTimestamp');
  };

  const handleUpdatePoints = (newPoints: number) => {
    if (user) {
      const updated = { ...user, points: newPoints };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const isAdmin = user && user.role && user.role.toLowerCase() === 'admin';

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Toaster position="top-right" />
        
        {/* Navbar with option to open Auth Modal */}
        <Navbar
          user={user}
          onLogout={handleLogout}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Global Login Modal for unauthenticated users */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/anime/:id" element={<AnimeDetailPage user={user} onUpdatePoints={handleUpdatePoints} />} />
            <Route path="/watch/:id" element={<WatchPage user={user} onUpdatePoints={handleUpdatePoints} />} />
            <Route path="/shop" element={<PointShopPage user={user} onUpdatePoints={handleUpdatePoints} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route
              path="/admin"
              element={
                isAdmin ? (
                  <AdminPage />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<RegisterPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
