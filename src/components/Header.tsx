import React from 'react';
import { Camera, Calendar, User, Sparkles } from 'lucide-react';
import { Customer } from '../types';

interface HeaderProps {
  customer: Customer | null;
  onOpenProfile: () => void;
  onOpenBooking: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  customer,
  onOpenProfile,
  onOpenBooking,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-studio-950/85 backdrop-blur-md border-b border-gold-500/15">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-3 text-left group focus:outline-none"
        >
          <div className="relative group-hover:scale-105 transition-transform duration-300">
            <img
              src="/logo.png"
              alt="Nilesh Studio Logo"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gold-400/50 shadow-glow-gold bg-black"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold tracking-wider text-lg text-gold-light-gradient">
                NILESH STUDIO
              </span>
              <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-studio-400 font-medium">
              Fine Art & Luxury Photoshoots
            </p>
          </div>
        </button>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenBooking}
            className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all duration-200"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Slot</span>
          </button>

          {customer ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-2 bg-studio-850 hover:bg-studio-800 border border-gold-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Customer Profile"
            >
              <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center font-bold text-xs">
                {customer.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-xs font-medium text-studio-200 max-w-[100px] truncate">
                {customer.fullName.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-1 bg-studio-850 hover:bg-studio-800 border border-gold-500/20 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gold-400 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
