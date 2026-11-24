import React, { useState } from 'react';
import { Camera, Sparkles, Phone, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import { Customer } from '../types';

interface AuthModalProps {
  onSuccess: (customer: Customer) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onSuccess,
  onCancel,
  isModal = false,
}) => {
  const [isReturning, setIsReturning] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Demo fill for convenience
  const handleDemoFill = () => {
    setFullName('Aarav Mehta');
    setPhoneNumber('9876543210');
    setEmail('aarav.mehta@example.com');
    setError(null);
  };

  // Graceful Guest Mode to explore categories and galleries freely without booking
  const handleGuestExplore = () => {
    const guestCustomer: Customer = {
      id: `guest-${Date.now()}`,
      fullName: 'Studio Guest',
      phoneNumber: '',
      email: undefined,
      createdAt: new Date().toISOString(),
      isGuest: true
    };
    onSuccess(guestCustomer);
  };

  // Fallback if backend is offline to browse galleries without being blocked
  const handleOfflineContinue = () => {
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '') || '9876543210';
    const guestCustomer: Customer = {
      id: `offline-${Date.now()}`,
      fullName: fullName.trim() || 'Studio Guest',
      phoneNumber: cleanPhone,
      email: email.trim() || undefined,
      createdAt: new Date().toISOString(),
      isGuest: true // Marked as guest: booking will require verified online registration
    };
    onSuccess(guestCustomer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!isReturning && !fullName.trim()) {
      setError('Full Name is required for registration.');
      return;
    }

    setLoading(true);

    try {
      if (isReturning) {
        // Look up returning customer by phone
        try {
          const customer = await api.getCustomerByPhone(cleanPhone);
          onSuccess(customer);
        } catch {
          setError('No account found with this phone number. Please register as a new customer.');
          setIsReturning(false);
        }
      } else {
        // Register or login
        const customer = await api.registerOrLogin(fullName.trim(), cleanPhone, email.trim() || undefined);
        onSuccess(customer);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="w-full max-w-md mx-auto bg-studio-900 border border-gold-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative Golden Ambient Blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Studio Emblem & Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center relative mb-3.5">
          <div className="absolute -inset-1 bg-gradient-to-r from-gold-500 to-amber-200 rounded-full blur opacity-60"></div>
          <img
            src="/logo.png"
            alt="Nilesh Studio"
            className="relative w-20 h-20 rounded-full object-cover ring-2 ring-gold-400 shadow-glow-gold bg-black"
          />
        </div>
        <div className="flex items-center justify-center space-x-1.5 mb-1">
          <h2 className="font-display font-extrabold text-2xl tracking-widest text-gold-light-gradient">
            NILESH STUDIO
          </h2>
          <Sparkles className="w-4 h-4 text-gold-400" />
        </div>
        <p className="text-xs uppercase tracking-widest text-gold-400/80 font-medium mb-1">
          Fine Art & Luxury Photoshoots
        </p>
        <p className="text-xs text-studio-400 mt-2">
          {isReturning
            ? 'Welcome back! Enter your phone number to access your bookings.'
            : 'Register in seconds to explore galleries, check live slots & book appointments.'}
        </p>
      </div>

      {/* Tabs: New Customer vs Returning */}
      <div className="flex bg-studio-950 p-1 rounded-xl mb-6 border border-studio-800">
        <button
          type="button"
          onClick={() => { setIsReturning(false); setError(null); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            !isReturning
              ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-studio-950 shadow'
              : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          New Customer
        </button>
        <button
          type="button"
          onClick={() => { setIsReturning(true); setError(null); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            isReturning
              ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-studio-950 shadow'
              : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          Returning Customer
        </button>
      </div>

      {/* Form Error Message */}
      {error && (
        <div className="mb-4 p-3.5 bg-red-950/70 border border-red-500/40 rounded-xl text-red-200 text-xs flex flex-col space-y-2.5">
          <div className="flex items-start space-x-2">
            <span className="text-red-400 font-bold text-sm leading-none">!</span>
            <span className="leading-relaxed">{error}</span>
          </div>
          <button
            type="button"
            onClick={handleOfflineContinue}
            className="self-end px-3 py-1.5 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-400/50 rounded-lg text-gold-300 font-semibold text-[11px] transition-colors"
          >
            Continue in Offline Mode →
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name (Only for New Customer) */}
        {!isReturning && (
          <div>
            <label className="block text-xs font-semibold text-studio-300 mb-1.5 uppercase tracking-wider">
              Full Name <span className="text-gold-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Mehta"
                className="w-full bg-studio-950 border border-studio-750 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl px-4 py-3 text-sm text-studio-100 placeholder-studio-500 outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-studio-300 mb-1.5 uppercase tracking-wider">
            Phone Number <span className="text-gold-400">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center space-x-1.5 pointer-events-none text-studio-400 text-xs font-semibold border-r border-studio-750 pr-2">
              <Phone className="w-3.5 h-3.5 text-gold-400" />
              <span>+91</span>
            </div>
            <input
              type="tel"
              required
              maxLength={12}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="98765 43210"
              className="w-full bg-studio-950 border border-studio-750 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl pl-20 pr-4 py-3 text-sm text-studio-100 placeholder-studio-500 outline-none transition-colors tracking-wide"
            />
          </div>
          <p className="text-[11px] text-studio-400 mt-1 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-gold-500 inline" />
            <span>No OTP needed. Simple & instant access.</span>
          </p>
        </div>

        {/* Email Address (Optional, for New Customer) */}
        {!isReturning && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-studio-300 uppercase tracking-wider">
                Email Address
              </label>
              <span className="text-[10px] text-studio-500 font-medium">Optional</span>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-3.5 pointer-events-none text-studio-400">
                <Mail className="w-4 h-4 text-gold-400/80" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aarav@example.com"
                className="w-full bg-studio-950 border border-studio-750 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 rounded-xl pl-10 pr-4 py-3 text-sm text-studio-100 placeholder-studio-500 outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold py-3.5 px-6 rounded-xl shadow-glow-gold flex items-center justify-center space-x-2 transition-all duration-200 transform active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-studio-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>{isReturning ? 'Continue to App' : 'Enter Nilesh Studio'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </form>

      {/* Quick Helpers */}
      <div className="mt-5 pt-4 border-t border-studio-800 flex items-center justify-between text-xs text-studio-400">
        <button
          type="button"
          onClick={handleDemoFill}
          className="text-gold-400 hover:text-gold-300 hover:underline flex items-center space-x-1"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Quick fill sample</span>
        </button>

        <button
          type="button"
          onClick={handleGuestExplore}
          className="text-studio-400 hover:text-gold-400 flex items-center space-x-1"
        >
          <span>Explore as Guest →</span>
        </button>

        {onCancel && isModal && (
          <button
            type="button"
            onClick={onCancel}
            className="text-studio-400 hover:text-studio-200"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-studio-950">
      {content}
    </div>
  );
};
