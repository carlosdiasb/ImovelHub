import React, { useState, useCallback } from 'react';
// FIX: Import Variants type from framer-motion.
import { AnimatePresence, motion, Variants } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import PropertyForm from './components/PropertyForm';
import { useAuth } from './context/AuthContext';
import CheckoutPage from './pages/CheckoutPage';
import RegistrationValidationPage from './pages/RegistrationValidationPage';

export type Page = 'home' | 'details' | 'dashboard' | 'auth' | 'create' | 'edit' | 'admin' | 'checkout' | 'registrationValidation';

// FIX: Explicitly type pageVariants with Variants from framer-motion to resolve type inference issue.
const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeInOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeInOut' } },
};

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const navigate = useCallback((targetPage: Page, propertyId?: string) => {
    if (propertyId) {
      setSelectedPropertyId(propertyId);
    }
    
    // Protected routes
    if ((targetPage === 'dashboard' || targetPage === 'create' || targetPage === 'edit' || targetPage === 'checkout' || targetPage === 'registrationValidation') && !user) {
        setPage('auth');
        return;
    }
    if (targetPage === 'admin' && user?.role !== 'admin') {
        setPage('home');
        return;
    }
    
    if (targetPage === 'home') {
        setSearchQuery(''); // Clear search when navigating home manually
    }

    setPage(targetPage);
    window.scrollTo(0, 0);
  }, [user]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage('home');
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage onNavigate={navigate} searchQuery={searchQuery} />;
      case 'details':
        return selectedPropertyId ? <DetailPage propertyId={selectedPropertyId} onNavigate={navigate} /> : <HomePage onNavigate={navigate} searchQuery="" />;
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case 'auth':
        return <AuthPage onAuthSuccess={() => navigate('home')} />;
      case 'create':
        return <PropertyForm onFormSubmit={() => navigate('dashboard')} />;
      case 'edit':
        return selectedPropertyId ? <PropertyForm propertyId={selectedPropertyId} onFormSubmit={() => navigate('dashboard')} /> : <DashboardPage onNavigate={navigate} />;
      case 'admin':
        return <AdminPage onNavigate={navigate} />;
      case 'checkout':
        return selectedPropertyId ? <CheckoutPage propertyId={selectedPropertyId} onNavigate={navigate} /> : <DashboardPage onNavigate={navigate} />;
      case 'registrationValidation':
        return <RegistrationValidationPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} searchQuery="" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-neutral-dark">
      <Header onNavigate={navigate} onSearch={handleSearch} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={page + (selectedPropertyId || '')}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}