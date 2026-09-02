import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import { Login } from './auth/Login.jsx';
import { Register } from './auth/Register.jsx';
import { RouterProvider, useRouter } from './context/RouterContext.jsx';
import { AnalysisProvider } from './context/AnalysisContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import { checkBackendHealth } from './services/api.js';

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { currentRoute, navigateTo } = useRouter();
  const [backendHealth, setBackendHealth] = useState({ ok: false, status: 'checking' });

  // Periodically check backend health on mount and every 30s
  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      const health = await checkBackendHealth();
      if (mounted) setBackendHealth(health);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // If user is authenticated and lands on login or register, redirect to analysis dashboard
  useEffect(() => {
    if (isAuthenticated && (currentRoute === '/login' || currentRoute === '/register')) {
      navigateTo('/analysis');
    }
  }, [isAuthenticated, currentRoute, navigateTo]);

  const renderActivePage = () => {
    switch (currentRoute) {
      case '/analysis':
      case '/results':
        return (
          <ProtectedRoute
            fallback={
              <Login
                onNavigateToRegister={() => navigateTo('/register')}
                onSuccess={() => navigateTo('/analysis')}
              />
            }
          >
            <AnalysisPage backendHealth={backendHealth} />
          </ProtectedRoute>
        );

      case '/about':
      case '/system':
        return <AboutPage backendHealth={backendHealth} />;

      case '/help':
      case '/docs':
        return <HelpPage backendHealth={backendHealth} />;

      case '/login':
        return (
          <Login
            onNavigateToRegister={() => navigateTo('/register')}
            onSuccess={() => navigateTo('/analysis')}
          />
        );

      case '/register':
        return (
          <Register
            onNavigateToLogin={() => navigateTo('/login')}
            onSuccess={() => navigateTo('/analysis')}
          />
        );

      case '/':
      default:
        return <HomePage backendHealth={backendHealth} />;
    }
  };

  return (
    <div className="gov-app-root">
      <Navbar backendHealth={backendHealth} />

      <div className="gov-app-main">
        {renderActivePage()}
      </div>

      <Footer backendHealth={backendHealth} />

      <style>{`
        .gov-app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-main);
          position: relative;
        }
        .gov-app-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AnalysisProvider>
          <AppContent />
        </AnalysisProvider>
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
