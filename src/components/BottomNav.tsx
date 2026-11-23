import React from 'react';
import { Home, Grid, CalendarPlus, BookOpen } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'categories' | 'booking' | 'my-bookings';
  onSelectTab: (tab: 'home' | 'categories' | 'booking' | 'my-bookings') => void;
  bookingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  bookingCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-studio-950/95 backdrop-blur-lg border-t border-gold-500/15 py-1.5 px-4 shadow-lg sm:max-w-md sm:mx-auto sm:rounded-t-2xl sm:bottom-2 sm:border sm:border-gold-500/25">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-200 ${
            activeTab === 'home'
              ? 'text-gold-400 font-semibold'
              : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-wide">Home</span>
          {activeTab === 'home' && (
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-0.5"></span>
          )}
        </button>

        {/* Portfolio / Categories */}
        <button
          onClick={() => onSelectTab('categories')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-200 ${
            activeTab === 'categories'
              ? 'text-gold-400 font-semibold'
              : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          <Grid className={`w-5 h-5 mb-0.5 ${activeTab === 'categories' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-wide">Services</span>
          {activeTab === 'categories' && (
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-0.5"></span>
          )}
        </button>

        {/* Center Booking Action */}
        <button
          onClick={() => onSelectTab('booking')}
          className={`relative -top-3.5 flex flex-col items-center justify-center`}
        >
          <div
            className={`w-13 h-13 p-3 rounded-full flex items-center justify-center shadow-glow-gold transition-all duration-300 ${
              activeTab === 'booking'
                ? 'bg-gradient-to-tr from-gold-500 to-gold-300 scale-105'
                : 'bg-gradient-to-tr from-gold-600 to-gold-400 hover:scale-105'
            }`}
          >
            <CalendarPlus className="w-6 h-6 text-studio-950 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-bold text-gold-400 tracking-wide mt-1">Book</span>
        </button>

        {/* My Bookings */}
        <button
          onClick={() => onSelectTab('my-bookings')}
          className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-200 ${
            activeTab === 'my-bookings'
              ? 'text-gold-400 font-semibold'
              : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          <div className="relative">
            <BookOpen className={`w-5 h-5 mb-0.5 ${activeTab === 'my-bookings' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {bookingCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-gold-500 text-studio-950 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {bookingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wide">My Bookings</span>
          {activeTab === 'my-bookings' && (
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-0.5"></span>
          )}
        </button>
      </div>
    </nav>
  );
};
