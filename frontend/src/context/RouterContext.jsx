import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RouterContext = createContext(null);

function normalizePath(pathname) {
  const lower = (pathname || '/').toLowerCase().replace(/\/$/, '') || '/';
  if (lower.startsWith('/analysis') || lower.startsWith('/results') || lower.startsWith('/workspace') || lower.startsWith('/dashboard')) return '/analysis';
  if (lower.startsWith('/about') || lower.startsWith('/project') || lower.startsWith('/system')) return '/about';
  if (lower.startsWith('/help') || lower.startsWith('/docs') || lower.startsWith('/documentation')) return '/help';
  if (lower.startsWith('/login')) return '/login';
  if (lower.startsWith('/register')) return '/register';
  return '/';
}

export function RouterProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState(() => normalizePath(window.location.pathname));
  const [routeState, setRouteState] = useState(null);

  const navigateTo = useCallback((path, state = null) => {
    const targetRoute = normalizePath(path);
    setCurrentRoute(targetRoute);
    setRouteState(state);

    if (window.location.pathname !== targetRoute) {
      window.history.pushState({ route: targetRoute, state }, '', targetRoute);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = (e) => {
      const target = normalizePath(window.location.pathname);
      setCurrentRoute(target);
      setRouteState(e.state?.state || null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const value = {
    currentRoute,
    routeState,
    navigateTo
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export default RouterContext;
