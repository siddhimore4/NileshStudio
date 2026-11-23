import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Edit2,
  LogOut,
  CalendarCheck,
  AlertCircle,
  FileText,
  XCircle,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { Customer, Booking, BookingStatus, PaymentStatus } from '../types';
import { api } from '../api';

interface MyBookingsScreenProps {
  customer: Customer | null;
  onOpenBooking: () => void;
  onEditProfile: () => void;
  onLogout: () => void;
  onRequireAuth: () => void;
}

export const MyBookingsScreen: React.FC<MyBookingsScreenProps> = ({
  customer,
  onOpenBooking,
  onEditProfile,
  onLogout,
  onRequireAuth,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelBooking, setConfirmCancelBooking] = useState<Booking | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!customer) return;
    setLoading(true);
    setActionError(null);
    try {
      const data = await api.getCustomerBookings(customer.id, customer.phoneNumber);
      setBookings(data);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customer) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [customer]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!customer) return;
    setCancellingId(bookingId);
    setActionError(null);
    try {
      await api.cancelBooking(bookingId, customer.id);
      setConfirmCancelBooking(null);
      await fetchBookings();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (!customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-studio-900 border border-gold-500/25 flex items-center justify-center mx-auto mb-4 text-gold-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-white mb-2">
          Sign In to View Bookings
        </h2>
        <p className="text-xs text-studio-400 mb-6">
          Access your private photoshoot schedule, booking status, and appointment details.
        </p>
        <button
          onClick={onRequireAuth}
          className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold px-6 py-3 rounded-xl shadow-glow-gold"
        >
          Sign In with Phone Number
        </button>
      </div>
    );
  }

  // Filter Bookings
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredBookings = bookings.filter((b) => {
    if (filter === 'upcoming') {
      return b.booking_date >= todayStr && b.status !== 'Cancelled';
    }
    if (filter === 'past') {
      return b.booking_date < todayStr || b.status === 'Completed' || b.status === 'Cancelled';
    }
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>Pending Studio Confirmation</span>
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
            <CalendarCheck className="w-3 h-3" />
            <span>Confirmed by Studio</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-400 bg-blue-400/10 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
            <span>✓ Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-400 bg-rose-400/10 border border-rose-400/30 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (payStatus?: PaymentStatus, payMethod?: string) => {
    switch (payStatus) {
      case 'Paid':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Paid</span>
          </span>
        );
      case 'Verification Pending':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>Payment Verification Pending</span>
          </span>
        );
      case 'Payment Rejected':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-400 bg-rose-400/10 border border-rose-400/30 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" />
            <span>Payment Rejected</span>
          </span>
        );
      case 'Pay After Shoot':
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-400 bg-blue-400/10 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
            <CreditCard className="w-3 h-3" />
            <span>Due After Shoot</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 animate-fade-in">
      {/* Customer Profile Card */}
      <div className="glass-panel p-5 rounded-3xl border border-gold-500/25 mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center text-studio-950 font-display font-extrabold text-2xl shadow-glow-gold shrink-0">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-xl font-bold text-white">
                  {customer.fullName}
                </h2>
                <ShieldCheck className="w-4 h-4 text-gold-400" />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-studio-300 mt-1">
                <span className="flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-gold-400" />
                  <span>+91 {customer.phoneNumber}</span>
                </span>
                {customer.email && (
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-gold-400" />
                    <span>{customer.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onEditProfile}
              className="flex items-center space-x-1 text-xs font-semibold text-studio-200 hover:text-gold-300 bg-studio-900 border border-studio-800 hover:border-gold-500/40 px-3 py-2 rounded-xl transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 border border-rose-900/40 px-3 py-2 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-white flex items-center space-x-2">
            <CalendarCheck className="w-4 h-4 text-gold-400" />
            <span>My Bookings History</span>
          </h3>
          <p className="text-xs text-studio-400">
            {bookings.length} {bookings.length === 1 ? 'appointment' : 'appointments'} on record
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="text-xs text-studio-400 hover:text-gold-300 p-2 rounded-lg transition-colors"
          title="Refresh bookings"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-studio-900 p-1 rounded-xl mb-4 border border-studio-800 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-gold-500 text-studio-950 shadow'
              : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
            filter === 'upcoming'
              ? 'bg-gold-500 text-studio-950 shadow'
              : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          Upcoming ({bookings.filter(b => b.booking_date >= todayStr && b.status !== 'Cancelled').length})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
            filter === 'past'
              ? 'bg-gold-500 text-studio-950 shadow'
              : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          Past / Completed
        </button>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-36 rounded-2xl skeleton-shimmer"></div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-card p-8 rounded-3xl text-center border border-studio-800">
          <div className="w-12 h-12 rounded-2xl bg-studio-900 border border-gold-500/20 flex items-center justify-center mx-auto mb-3 text-gold-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-lg font-bold text-white mb-1">
            No bookings found
          </h4>
          <p className="text-xs text-studio-400 mb-5 max-w-xs mx-auto">
            {filter === 'upcoming'
              ? 'You have no upcoming photoshoot appointments scheduled.'
              : 'You have not booked any photoshoot sessions yet.'}
          </p>
          <button
            onClick={onOpenBooking}
            className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-glow-gold"
          >
            Book Your First Photoshoot
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="glass-panel p-4 sm:p-5 rounded-2xl border border-gold-500/20 hover:border-gold-500/40 transition-all shadow-md"
            >
              {/* Header: Service + Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-studio-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] font-bold text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded">
                      {b.id}
                    </span>
                    <span className="text-[11px] text-studio-400">
                      Booked {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-white mt-1">
                    {b.category_name}
                    {b.subcategory_name && (
                      <span className="text-gold-300 font-sans text-xs ml-1.5 font-semibold">
                        ({b.subcategory_name})
                      </span>
                    )}
                  </h4>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                  {getStatusBadge(b.status)}
                  {getPaymentStatusBadge(b.payment_status, b.payment_method)}
                </div>
              </div>

              {/* Appointment Date & Slot */}
              <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                <div className="flex items-center space-x-2 text-studio-200">
                  <Calendar className="w-4 h-4 text-gold-400 shrink-0" />
                  <div>
                    <span className="text-studio-500 block text-[10px]">Session Date</span>
                    <span className="font-semibold text-white">
                      {new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-studio-200">
                  <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                  <div>
                    <span className="text-studio-500 block text-[10px]">Appointment Slot</span>
                    <span className="font-bold text-gold-300">{b.time_slot}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Price Breakdown Details */}
              <div className="p-3 bg-studio-950/80 rounded-xl border border-studio-800 text-xs mb-3 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-studio-400">Payment Option:</span>
                  <span className="font-semibold text-white">{b.payment_method || 'Pay After Shoot'}</span>
                </div>
                {b.final_payable_amount ? (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-studio-400">Booking Amount:</span>
                    <div className="flex items-center space-x-2">
                      {b.discount_amount && b.discount_amount > 0 ? (
                        <>
                          <span className="line-through text-studio-500 font-mono">₹{b.original_amount?.toLocaleString()}</span>
                          <span className="text-emerald-400 font-bold font-mono text-[10px]">-20%</span>
                        </>
                      ) : null}
                      <span className="font-bold text-gold-300 font-mono text-xs">₹{b.final_payable_amount.toLocaleString()}</span>
                    </div>
                  </div>
                ) : null}
                {b.upi_transaction_id && (
                  <div className="flex justify-between items-center text-[10px] pt-1 border-t border-studio-850">
                    <span className="text-studio-500">Submitted UTR:</span>
                    <span className="font-mono text-studio-200">{b.upi_transaction_id}</span>
                  </div>
                )}
                {b.payment_status === 'Payment Rejected' && b.payment_rejection_reason && (
                  <div className="p-2 bg-rose-950/40 rounded-lg border border-rose-900/40 text-[10px] text-rose-300 mt-1">
                    <strong className="block text-rose-200">Rejection Reason:</strong>
                    {b.payment_rejection_reason}
                  </div>
                )}
              </div>

              {/* Special Notes if any */}
              {b.special_notes && (
                <div className="p-2.5 bg-studio-950/70 rounded-xl border border-studio-800 text-[11px] text-studio-300 mb-3 flex items-start space-x-2">
                  <FileText className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-studio-400 block text-[10px]">Your Special Notes:</span>
                    <span>{b.special_notes}</span>
                  </div>
                </div>
              )}

              {/* Bottom Actions: Cancel if Pending */}
              {b.status === 'Pending' && (
                <div className="pt-2 border-t border-studio-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-studio-500">
                    Awaiting studio verification
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmCancelBooking(b)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold hover:underline"
                  >
                    Cancel Booking Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Booking Cancellation */}
      {confirmCancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-studio-900 border border-gold-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white mb-1">
              Cancel Appointment Request?
            </h3>
            <p className="text-xs text-studio-400 mb-4">
              Are you sure you want to cancel booking <span className="font-mono text-gold-400 font-bold">{confirmCancelBooking.id}</span> for {confirmCancelBooking.booking_date} at {confirmCancelBooking.time_slot}? This will release the slot for other customers.
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setConfirmCancelBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-studio-800 text-studio-300 font-semibold text-xs hover:bg-studio-750"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancellingId === confirmCancelBooking.id}
                onClick={() => handleCancelBooking(confirmCancelBooking.id)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors disabled:opacity-50"
              >
                {cancellingId === confirmCancelBooking.id ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
