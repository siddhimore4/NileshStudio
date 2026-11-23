import React, { useState } from 'react';
import { X, User, Phone, Mail, Check, AlertCircle } from 'lucide-react';
import { Customer } from '../types';
import { api } from '../api';

interface ProfileModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdateSuccess: (updated: Customer) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  customer,
  onClose,
  onUpdateSuccess,
}) => {
  const [fullName, setFullName] = useState(customer.fullName);
  const [email, setEmail] = useState(customer.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Full Name cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await api.updateCustomer(customer.id, fullName.trim(), email.trim() || undefined);
      onUpdateSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-studio-900 border border-gold-500/30 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-studio-950 text-studio-400 hover:text-white flex items-center justify-center border border-studio-800"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-serif text-xl font-bold text-white mb-1">
          Edit Customer Profile
        </h3>
        <p className="text-xs text-studio-400 mb-5">
          Update your contact details for photoshoot booking communications.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-studio-300 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-gold-400">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-studio-950 border border-studio-750 focus:border-gold-500 rounded-xl px-4 py-2.5 text-sm text-studio-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-studio-300 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="p-2.5 bg-studio-950/60 border border-studio-800 rounded-xl text-sm text-studio-400 flex items-center justify-between">
              <span>+91 {customer.phoneNumber}</span>
              <span className="text-[10px] text-studio-500 font-semibold uppercase">Fixed Account ID</span>
            </div>
            <p className="text-[10px] text-studio-500 mt-1">
              Phone number is your permanent client identifier at Nilesh Studio.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-studio-300 uppercase tracking-wider">
                Email Address
              </label>
              <span className="text-[10px] text-studio-500">Optional</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@example.com"
              className="w-full bg-studio-950 border border-studio-750 focus:border-gold-500 rounded-xl px-4 py-2.5 text-sm text-studio-100 outline-none"
            />
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-studio-800 hover:bg-studio-750 text-studio-300 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs shadow-glow-gold flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
