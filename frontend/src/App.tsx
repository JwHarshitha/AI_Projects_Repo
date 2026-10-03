import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { CommandPalette } from './components/layout/CommandPalette';
import { Dashboard } from './pages/Dashboard';
import { SingleAnalysis } from './pages/SingleAnalysis';
import { BatchAnalysis } from './pages/BatchAnalysis';
import { FeedbackExplorer } from './pages/FeedbackExplorer';
import { InsightsPage } from './pages/InsightsPage';
import { TrendsPage } from './pages/TrendsPage';
import { ModelsPage } from './pages/ModelsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname === '/' ? '/dashboard' : window.location.pathname;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 glass-card rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 mx-auto flex items-center justify-center animate-spin">
            ✦
          </div>
          <p className="text-sm font-medium text-slate-300">Initializing SentinelAI Platform...</p>
          <LoadingSkeleton rows={2} height="h-3" />
        </div>
      </div>
    );
  }

  // Auth routing: if not authenticated, show Login or Register
  if (!isAuthenticated) {
    if (currentPath === '/register') {
      return <RegisterPage onNavigate={navigateTo} />;
    }
    return <LoginPage onNavigate={navigateTo} />;
  }

  // Active page router
  const renderActiveScreen = () => {
    switch (currentPath) {
      case '/dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case '/analyze':
        return <SingleAnalysis />;
      case '/batch-analysis':
        return <BatchAnalysis />;
      case '/feedback':
        return <FeedbackExplorer />;
      case '/insights':
        return <InsightsPage />;
      case '/trends':
        return <TrendsPage />;
      case '/models':
        return <ModelsPage />;
      case '/reports':
        return <ReportsPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex">
      {/* Persistent Left Sidebar (Desktop) / Slide-over (Mobile) */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={navigateTo}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top bar with Breadcrumbs, Global Search, and Notifications */}
        <TopBar
          currentPath={currentPath}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          onNavigate={navigateTo}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={navigateTo}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
