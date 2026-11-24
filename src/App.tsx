import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Customer, Category, Booking } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { CategoryDetailView } from './components/CategoryDetailView';
import { BookingScreen } from './components/BookingScreen';
import { MyBookingsScreen } from './components/MyBookingsScreen';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { MobileFrame } from './components/MobileFrame';
import { InstallAppModal } from './components/InstallAppModal';
import { FALLBACK_CATEGORIES } from './data/fallbackCatalog';

export function App() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const cached = localStorage.getItem('nds_cached_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return FALLBACK_CATEGORIES;
  });
  const [loadingApp, setLoadingApp] = useState<boolean>(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'booking' | 'my-bookings'>('home');
  const [viewingCategoryId, setViewingCategoryId] = useState<string | null>(null);
  const [bookingPreselect, setBookingPreselect] = useState<{ categoryId?: string; subcategoryId?: string }>({});

  // Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [upcomingBookingCount, setUpcomingBookingCount] = useState<number>(0);

  // 1. Initial Load: Retrieve stored customer session & load categories
  useEffect(() => {
    async function initApp() {
      // Load saved customer from localStorage
      const saved = localStorage.getItem('nilesh_studio_customer');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCustomer(parsed);
        } catch (e) {
          console.error('Failed to parse customer cache:', e);
        }
      }

      // Load Categories from Backend (network refresh with persistent cache)
      try {
        const fetchedCats = await api.getCategories();
        if (fetchedCats && Array.isArray(fetchedCats) && fetchedCats.length > 0) {
          setCategories(fetchedCats);
          try {
            localStorage.setItem('nds_cached_categories', JSON.stringify(fetchedCats));
          } catch (e) {
            // ignore storage quota error
          }
        }
      } catch (err) {
        console.warn('Network categories fetch failed, using cached/bundled catalog:', err);
      } finally {
        setLoadingApp(false);
      }
    }

    initApp();
  }, []);

  // 2. Fetch booking count whenever customer changes
  useEffect(() => {
    async function loadBookingCount() {
      if (customer) {
        try {
          const bookings = await api.getCustomerBookings(customer.id, customer.phoneNumber);
          const todayStr = new Date().toISOString().split('T')[0];
          const active = bookings.filter(b => b.booking_date >= todayStr && b.status !== 'Cancelled');
          setUpcomingBookingCount(active.length);
        } catch (err) {
          console.error('Error fetching booking count:', err);
        }
      } else {
        setUpcomingBookingCount(0);
      }
    }
    loadBookingCount();
  }, [customer]);

  // Auth Handlers
  const handleAuthSuccess = (loggedCustomer: Customer) => {
    setCustomer(loggedCustomer);
    localStorage.setItem('nilesh_studio_customer', JSON.stringify(loggedCustomer));
    setShowAuthModal(false);
    // If was on first screen, redirect to Home Page
    setActiveTab('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('nilesh_studio_customer');
    setCustomer(null);
    setActiveTab('home');
  };

  const handleProfileUpdated = (updated: Customer) => {
    setCustomer(updated);
    localStorage.setItem('nilesh_studio_customer', JSON.stringify(updated));
  };

  // Navigation Handlers
  const handleSelectCategory = (categoryId: string) => {
    setViewingCategoryId(categoryId);
  };

  const handleOpenBooking = (categoryId?: string, subcategoryId?: string) => {
    if (!customer || customer.isGuest || customer.id.startsWith('guest-') || customer.id.startsWith('offline-')) {
      setShowAuthModal(true);
      return;
    }
    setBookingPreselect({ categoryId, subcategoryId });
    setViewingCategoryId(null);
    setActiveTab('booking');
  };

  const handleNavigateHome = () => {
    setViewingCategoryId(null);
    setActiveTab('home');
  };

  const handleBookingCompleted = (_booking: Booking) => {
    setUpcomingBookingCount(prev => prev + 1);
  };

  // If app is still initializing
  if (loadingApp) {
    return (
      <div className="min-h-screen bg-studio-950 flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center animate-spin mb-4">
          <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full"></div>
        </div>
        <h2 className="font-display font-bold text-xl text-gold-400 tracking-wider">
          NILESH STUDIO
        </h2>
        <p className="text-xs text-studio-400 mt-1">Connecting to Studio Backend...</p>
      </div>
    );
  }

  // Requirement 1: First screen of the app must be the clean & attractive Welcome / Registration Page if not signed in
  if (!customer && !localStorage.getItem('nilesh_studio_customer')) {
    return (
      <MobileFrame>
        <AuthModal
          onSuccess={handleAuthSuccess}
          isModal={false}
        />
      </MobileFrame>
    );
  }

  // Find viewing category object if currently inspecting a category
  const activeCategory = viewingCategoryId
    ? categories.find(c => c.id === viewingCategoryId)
    : null;

  return (
    <MobileFrame>
      <div className="min-h-screen bg-studio-950 flex flex-col relative">
        {/* Sticky Header */}
        <Header
          customer={customer}
          onOpenProfile={() => {
            if (customer) setShowProfileModal(true);
            else setShowAuthModal(true);
          }}
          onOpenBooking={() => handleOpenBooking()}
          onNavigateHome={handleNavigateHome}
          onOpenInstall={() => setShowInstallModal(true)}
        />

        {/* Main View Area */}
        <main className="flex-1">
          {/* 1. Category Detail View (Indoor, Outdoor, Wedding, Pre-Wedding) */}
          {activeCategory ? (
            <CategoryDetailView
              category={activeCategory}
              onBack={() => setViewingCategoryId(null)}
              onBookNow={handleOpenBooking}
            />
          ) : (
            <>
              {/* 2. Home Tab */}
              {activeTab === 'home' && (
                <HomeScreen
                  categories={categories}
                  customer={customer}
                  onSelectCategory={handleSelectCategory}
                  onOpenBooking={handleOpenBooking}
                  onRequireAuth={() => setShowAuthModal(true)}
                />
              )}

              {/* 3. Services / Categories Tab */}
              {activeTab === 'categories' && (
                <div className="px-4 py-6 max-w-4xl mx-auto animate-fade-in pb-28">
                  <div className="mb-6">
                    <h1 className="font-serif text-3xl font-bold text-white mb-1">
                      Our Photography Services
                    </h1>
                    <p className="text-xs text-studio-400">
                      Explore categories, browse sample photograph galleries, and reserve slots.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className="glass-card hover:glass-card-gold p-4 rounded-3xl cursor-pointer transition-all duration-300 hover:shadow-glow-gold group"
                      >
                        <div className="h-48 rounded-2xl overflow-hidden mb-3 relative">
                          <img
                            src={cat.cover_image}
                            alt={cat.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-studio-950/80 via-transparent to-transparent"></div>
                          <span className="absolute bottom-3 left-3 font-serif text-xl font-bold text-white">
                            {cat.title}
                          </span>
                        </div>
                        <p className="text-xs text-studio-300 line-clamp-2 mb-3">
                          {cat.description}
                        </p>
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-gold-400 group-hover:underline">View Portfolio →</span>
                          <span className="text-studio-500 text-[10px]">
                            {cat.subcategories?.length ? `${cat.subcategories.length} subcategories` : 'Fine Art'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Booking System Tab */}
              {activeTab === 'booking' && (
                <BookingScreen
                  customer={customer}
                  categories={categories}
                  initialCategoryId={bookingPreselect.categoryId}
                  initialSubcategoryId={bookingPreselect.subcategoryId}
                  onBookingComplete={handleBookingCompleted}
                  onRequireAuth={() => setShowAuthModal(true)}
                  onGoToMyBookings={() => setActiveTab('my-bookings')}
                />
              )}

              {/* 5. My Bookings Tab */}
              {activeTab === 'my-bookings' && (
                <MyBookingsScreen
                  customer={customer}
                  onOpenBooking={() => handleOpenBooking()}
                  onEditProfile={() => setShowProfileModal(true)}
                  onLogout={handleLogout}
                  onRequireAuth={() => setShowAuthModal(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Floating Mobile Bottom Navigation */}
        <BottomNav
          activeTab={activeCategory ? 'categories' : activeTab}
          onSelectTab={(tab) => {
            if ((tab === 'booking' || tab === 'my-bookings') && (!customer || customer.isGuest || customer.id.startsWith('guest-') || customer.id.startsWith('offline-'))) {
              setShowAuthModal(true);
              return;
            }
            setViewingCategoryId(null);
            setActiveTab(tab);
          }}
          bookingCount={upcomingBookingCount}
        />

        {/* Auth Modal (when triggered from guest booking or profile switch) */}
        {showAuthModal && (
          <AuthModal
            onSuccess={handleAuthSuccess}
            onCancel={() => setShowAuthModal(false)}
            isModal={true}
          />
        )}

        {/* Profile Edit Modal */}
        {showProfileModal && customer && (
          <ProfileModal
            customer={customer}
            onClose={() => setShowProfileModal(false)}
            onUpdateSuccess={handleProfileUpdated}
          />
        )}

        {/* Install App on Phone Modal */}
        <InstallAppModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
        />
      </div>
    </MobileFrame>
  );
}
