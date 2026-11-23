import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  User,
  Phone,
  Mail,
  FileText,
  Copy,
  Check,
  RotateCcw,
  QrCode,
  Download,
  UploadCloud,
  ShieldAlert,
  Percent,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Category, Subcategory, TimeSlot, Customer, Booking, StudioPaymentSettings, ServicePricingBreakdown } from '../types';
import { api } from '../api';

interface BookingScreenProps {
  customer: Customer | null;
  categories: Category[];
  initialCategoryId?: string;
  initialSubcategoryId?: string;
  onBookingComplete: (booking: Booking) => void;
  onRequireAuth: () => void;
  onGoToMyBookings: () => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({
  customer,
  categories,
  initialCategoryId,
  initialSubcategoryId,
  onBookingComplete,
  onRequireAuth,
  onGoToMyBookings,
}) => {
  // Steps: 1: Service, 2: Date, 3: Slot, 4: Customer Details, 5: Payment Method & Summary, 6: Confirmation
  const [step, setStep] = useState<number>(initialCategoryId ? 2 : 1);

  // Form State
  const [selectedCatId, setSelectedCatId] = useState<string>(initialCategoryId || (categories[0]?.id || 'indoor'));
  const [selectedSubcatId, setSelectedSubcatId] = useState<string>(initialSubcategoryId || '');
  
  // Date State (Defaults to tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  
  const [selectedDate, setSelectedDate] = useState<string>(tomorrowStr);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1));

  // Time Slot State
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Customer Details Form (Prepopulated from customer or editable)
  const [customerName, setCustomerName] = useState<string>(customer?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(customer?.phoneNumber || '');
  const [email, setEmail] = useState<string>(customer?.email || '');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Payment System State
  const [paymentMethod, setPaymentMethod] = useState<'pay_advance' | 'pay_later'>('pay_advance');
  const [policyAcknowledged, setPolicyAcknowledged] = useState<boolean>(false);
  const [upiTransactionId, setUpiTransactionId] = useState<string>('');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>('');
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [studioSettings, setStudioSettings] = useState<StudioPaymentSettings>({
    upiId: 'nileshstudio@upi',
    upiName: 'Nilesh Studio Fine Art',
    qrCodeUrl: ''
  });
  const [pricing, setPricing] = useState<ServicePricingBreakdown>({
    originalAmount: 5999,
    discountPercentage: 20,
    discountAmount: 1200,
    finalPayableAmount: 4799
  });
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Update customer fields when customer prop changes
  useEffect(() => {
    if (customer) {
      if (!customerName) setCustomerName(customer.fullName);
      if (!phoneNumber) setPhoneNumber(customer.phoneNumber);
      if (!email && customer.email) setEmail(customer.email);
    }
  }, [customer]);

  // Load Studio Payment Settings (UPI QR Code and UPI ID)
  useEffect(() => {
    async function loadPaymentSettings() {
      try {
        const settings = await api.getPaymentSettings();
        setStudioSettings(settings);
      } catch (err) {
        console.error('Failed to load studio payment settings:', err);
      }
    }
    loadPaymentSettings();
  }, []);

  // Selected Category Object
  const selectedCategory = categories.find(c => c.id === selectedCatId) || categories[0];
  const isIndoorOrOutdoor = selectedCategory?.id === 'indoor' || selectedCategory?.id === 'outdoor';

  // Automatically select first subcategory if indoor/outdoor and none selected
  useEffect(() => {
    if (isIndoorOrOutdoor && selectedCategory?.subcategories?.length > 0) {
      if (!selectedSubcatId || !selectedCategory.subcategories.some(s => s.id === selectedSubcatId)) {
        setSelectedSubcatId(selectedCategory.subcategories[0].id);
      }
    } else {
      setSelectedSubcatId('');
    }
  }, [selectedCategory, isIndoorOrOutdoor]);

  // Recalculate Pricing dynamically whenever category, subcategory, or paymentMethod changes
  useEffect(() => {
    async function updatePricing() {
      if (!selectedCategory) return;
      try {
        const res = await api.getPricing(selectedCategory.id, selectedSubcatId || undefined, paymentMethod);
        setPricing(res);
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      }
    }
    updatePricing();
  }, [selectedCategory, selectedSubcatId, paymentMethod]);

  // Load Real-Time Slot Availability whenever selectedDate changes
  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate) return;
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const fetchedSlots = await api.getSlotAvailability(selectedDate);
        setSlots(fetchedSlots);
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchAvailability();
  }, [selectedDate]);

  // Calendar Helpers
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const renderCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Empty cells for padding before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 w-10 flex items-center justify-center"></div>
      );
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = dateStr < todayStr;
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === todayStr;

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={isPast}
          onClick={() => {
            setSelectedDate(dateStr);
            setBookingError(null);
          }}
          className={`h-10 w-10 mx-auto rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all duration-200 relative ${
            isSelected
              ? 'bg-gradient-to-tr from-gold-500 to-gold-400 text-studio-950 font-bold shadow-glow-gold scale-105 z-10'
              : isPast
              ? 'text-studio-700 cursor-not-allowed line-through opacity-30'
              : 'text-studio-200 hover:bg-studio-800 hover:text-gold-300'
          }`}
        >
          <span>{day}</span>
          {isToday && !isSelected && (
            <span className="w-1 h-1 bg-gold-400 rounded-full mt-0.5"></span>
          )}
        </button>
      );
    }

    return days;
  };

  const handlePrevMonth = () => {
    const prev = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    const curMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prev >= curMonthStart) {
      setCalendarMonth(prev);
    }
  };

  const handleNextMonth = () => {
    const next = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 6, 1);
    if (next <= maxDate) {
      setCalendarMonth(next);
    }
  };

  // Handle Payment Screenshot Upload (converts to base64 data URL)
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setBookingError('Screenshot file size must be less than 5MB.');
      return;
    }

    setScreenshotFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPaymentScreenshotUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Copy UPI ID to clipboard
  const copyUpiId = () => {
    navigator.clipboard.writeText(studioSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Download QR Code image
  const downloadQrCode = () => {
    if (!studioSettings.qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = studioSettings.qrCodeUrl;
    a.download = 'NileshStudio_UPI_QRCode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Submit Booking with Real-Time Database Transaction & Payment Details
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!customer) {
      onRequireAuth();
      return;
    }

    if (!selectedSlot) {
      setBookingError('Please select an available time slot.');
      return;
    }

    // Advance Payment Validations
    if (paymentMethod === 'pay_advance') {
      if (!policyAcknowledged) {
        setBookingError('Please acknowledge that advance payments with 20% discount are strictly non-refundable before proceeding.');
        return;
      }
      if (!upiTransactionId.trim()) {
        setBookingError('Please enter your UPI Transaction ID / UTR number after completing the payment.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const selectedSubcat = selectedCategory.subcategories?.find(s => s.id === selectedSubcatId);

      const booking = await api.createBooking({
        customerId: customer.id,
        customerName: customerName.trim() || customer.fullName,
        phoneNumber: phoneNumber.trim() || customer.phoneNumber,
        email: email.trim() || customer.email || undefined,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.title,
        subcategoryId: selectedSubcat?.id || undefined,
        subcategoryName: selectedSubcat?.title || undefined,
        bookingDate: selectedDate,
        timeSlot: selectedSlot,
        specialNotes: specialNotes.trim() || undefined,
        paymentMethod,
        upiTransactionId: paymentMethod === 'pay_advance' ? upiTransactionId.trim() : undefined,
        paymentScreenshotUrl: paymentMethod === 'pay_advance' && paymentScreenshotUrl ? paymentScreenshotUrl : undefined,
      });

      setConfirmedBooking(booking);
      setStep(6);
      onBookingComplete(booking);

      // Trigger Celebration Confetti!
      try {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F4E6BC', '#FFFFFF', '#B89223']
        });
      } catch (err) {}
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : 'Failed to book slot. Please choose another slot.');
      try {
        const refreshed = await api.getSlotAvailability(selectedDate);
        setSlots(refreshed);
      } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  const copyBookingId = () => {
    if (confirmedBooking) {
      navigator.clipboard.writeText(confirmedBooking.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // --- STEP 6: CONFIRMATION ACKNOWLEDGEMENT SCREEN ---
  if (step === 6 && confirmedBooking) {
    const isAdvance = confirmedBooking.payment_method?.includes('Advance') || confirmedBooking.payment_method === 'Pay Before Shoot';

    return (
      <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in">
        <div className="bg-gradient-to-b from-studio-900 to-studio-950 border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center">
          <div className="w-16 h-16 rounded-full bg-gold-500/20 border-2 border-gold-500 flex items-center justify-center mx-auto mb-4 text-gold-400 shadow-glow-gold animate-bounce">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-400 mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Booking Request Submitted ({confirmedBooking.status})</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
            Photoshoot Appointment Reserved!
          </h2>
          <p className="text-xs sm:text-sm text-studio-300 max-w-sm mx-auto mb-6">
            Thank you, <span className="font-semibold text-white">{confirmedBooking.customer_name}</span>. Your appointment has been recorded and is pending studio confirmation.
          </p>

          {/* Booking & Payment Details Card */}
          <div className="glass-panel p-5 rounded-2xl mb-6 text-left border border-gold-500/25">
            <div className="flex items-center justify-between border-b border-studio-800 pb-3 mb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-studio-400 font-bold block">
                  Unique Booking ID
                </span>
                <span className="font-mono text-base font-bold text-gold-400">
                  {confirmedBooking.id}
                </span>
              </div>
              <button
                type="button"
                onClick={copyBookingId}
                className="flex items-center space-x-1 text-xs text-studio-300 hover:text-gold-400 bg-studio-800 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <span className="text-studio-500 block">Service</span>
                <span className="font-semibold text-studio-100">
                  {confirmedBooking.category_name}
                  {confirmedBooking.subcategory_name ? ` • ${confirmedBooking.subcategory_name}` : ''}
                </span>
              </div>
              <div>
                <span className="text-studio-500 block">Date & Slot</span>
                <span className="font-semibold text-gold-300">
                  {confirmedBooking.booking_date} at {confirmedBooking.time_slot}
                </span>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="p-3 bg-studio-950/80 rounded-xl border border-studio-800 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-studio-400">Payment Option</span>
                <span className="font-bold text-white">
                  {confirmedBooking.payment_method || (isAdvance ? 'Pay Before Shoot' : 'Pay After Shoot')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-studio-400">Original Amount</span>
                <span className="text-studio-300 font-mono">₹{confirmedBooking.original_amount?.toLocaleString() || '0'}</span>
              </div>
              {confirmedBooking.discount_amount && confirmedBooking.discount_amount > 0 ? (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Advance Discount (20%)</span>
                  <span className="font-mono font-bold">-₹{confirmedBooking.discount_amount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between items-center pt-1.5 border-t border-studio-800 font-bold">
                <span className="text-gold-400">Final Payable Amount</span>
                <span className="text-base text-gold-300 font-mono">₹{confirmedBooking.final_payable_amount?.toLocaleString() || '0'}</span>
              </div>

              <div className="pt-2 border-t border-studio-800 flex justify-between items-center">
                <span className="text-studio-400">Payment Status</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  confirmedBooking.payment_status === 'Paid'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : isAdvance
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                }`}>
                  {isAdvance ? 'Verification Pending' : 'Payment Due After Photoshoot'}
                </span>
              </div>

              {confirmedBooking.upi_transaction_id && (
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-studio-500">Submitted UTR</span>
                  <span className="font-mono text-studio-200">{confirmedBooking.upi_transaction_id}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-studio-950/60 rounded-xl border border-studio-800 text-[11px] text-studio-400 mb-6 text-left leading-relaxed">
            <span className="text-gold-400 font-semibold block mb-0.5">Payment Verification & Confirmation:</span>
            {isAdvance ? (
              <span>Your advance payment receipt (UTR: <strong className="text-white">{confirmedBooking.upi_transaction_id}</strong>) is currently undergoing manual verification by our studio manager. Once matched with our studio account, your status will update to <span className="text-emerald-400 font-bold">Paid</span>.</span>
            ) : (
              <span>You have chosen to pay after completing your shoot. Payment will be collected at the studio upon completion of your photography session.</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={onGoToMyBookings}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold py-3.5 px-6 rounded-xl shadow-glow-gold flex items-center justify-center space-x-2 transition-all"
            >
              <span>View in My Bookings</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setConfirmedBooking(null);
                setStep(1);
                setSelectedSlot('');
                setUpiTransactionId('');
                setPaymentScreenshotUrl('');
                setScreenshotFileName('');
                setPolicyAcknowledged(false);
              }}
              className="w-full bg-studio-900 hover:bg-studio-850 text-studio-300 font-semibold py-3 px-6 rounded-xl border border-studio-800 flex items-center justify-center space-x-2 transition-colors text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Book Another Appointment</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN BOOKING FLOW ---
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 animate-fade-in">
      {/* Title & Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white">
              Appointment Booking
            </h1>
          </div>
          <span className="text-xs font-semibold text-gold-400 bg-studio-900 border border-gold-500/20 px-2.5 py-1 rounded-lg">
            Step {step} of 5
          </span>
        </div>
        <p className="text-xs text-studio-400">
          Reserve your preferred date and time slot with live availability & payment options.
        </p>

        {/* 5-Step Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5 mt-4">
          {['Service', 'Date', 'Time Slot', 'Details', 'Payment'].map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={label} className="text-center">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 mb-1 ${
                    isCompleted
                      ? 'bg-gold-500'
                      : isCurrent
                      ? 'bg-gradient-to-r from-gold-500 to-amber-200'
                      : 'bg-studio-800'
                  }`}
                ></div>
                <span className={`text-[9px] sm:text-[10px] font-medium truncate block ${isCurrent ? 'text-gold-300 font-bold' : isCompleted ? 'text-studio-200' : 'text-studio-500'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {bookingError && (
        <div className="mb-6 p-4 bg-red-950/70 border border-red-500/40 rounded-2xl text-red-200 text-xs flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Booking Alert</span>
            <span>{bookingError}</span>
          </div>
        </div>
      )}

      {/* STEP 1: SELECT PHOTOGRAPHY SERVICE & SUBCATEGORY */}
      {step === 1 && (
        <div className="space-y-6 animate-slide-up">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-studio-300 mb-3">
              1. Choose Photography Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => {
                const isSelected = selectedCatId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCatId(cat.id);
                      setBookingError(null);
                    }}
                    className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center space-x-3 ${
                      isSelected
                        ? 'bg-studio-850 border-gold-500 shadow-glow-gold'
                        : 'bg-studio-900 border-studio-800 hover:border-gold-500/30'
                    }`}
                  >
                    <img
                      src={cat.cover_image}
                      alt={cat.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-gold-400' : 'text-white'}`}>
                          {cat.title}
                        </h4>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-studio-400 line-clamp-1 mt-0.5">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subcategory selection (if Indoor or Outdoor) */}
          {isIndoorOrOutdoor && selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-studio-300 mb-3">
                2. Select Subcategory for {selectedCategory.title}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {selectedCategory.subcategories.map((subcat) => {
                  const isSelected = selectedSubcatId === subcat.id;
                  return (
                    <button
                      key={subcat.id}
                      type="button"
                      onClick={() => setSelectedSubcatId(subcat.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-gold-500/15 border-gold-500 text-gold-300 font-bold'
                          : 'bg-studio-900 border-studio-800 text-studio-300 hover:border-studio-700'
                      }`}
                    >
                      <div className="text-xs font-semibold flex items-center justify-between">
                        <span>{subcat.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-gold-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full mt-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold py-3.5 px-6 rounded-xl shadow-glow-gold flex items-center justify-center space-x-2 transition-all"
          >
            <span>Proceed to Date Selection</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      )}

      {/* STEP 2: SELECT BOOKING DATE (INTERACTIVE CALENDAR) */}
      {step === 2 && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-studio-400 hover:text-gold-300 flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Service</span>
            </button>
            <span className="text-xs text-gold-400 font-medium">
              Selected: {selectedCategory.title} {selectedSubcatId ? `(${selectedCategory.subcategories?.find(s => s.id === selectedSubcatId)?.title})` : ''}
            </span>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-gold-500/25">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-white">
                {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-lg bg-studio-900 border border-studio-800 flex items-center justify-center text-studio-300 hover:text-white hover:border-gold-500/40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-lg bg-studio-900 border border-studio-800 flex items-center justify-center text-studio-300 hover:text-white hover:border-gold-500/40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="text-[11px] font-bold text-studio-400 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {renderCalendarDays()}
            </div>

            <div className="mt-4 pt-3 border-t border-studio-800 flex items-center justify-between text-[11px] text-studio-400">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gold-500"></span>
                <span>Selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-studio-600 line-through">Past Dates (Disabled)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-studio-900 border border-gold-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <CalendarIcon className="w-4 h-4 text-gold-400" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-studio-400 font-bold block">
                  Chosen Date
                </span>
                <span className="text-sm font-bold text-white">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(3)}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold py-3.5 px-6 rounded-xl shadow-glow-gold flex items-center justify-center space-x-2 transition-all"
          >
            <span>Check Available Time Slots</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      )}

      {/* STEP 3: SELECT TIME SLOT & REAL-TIME AVAILABILITY */}
      {step === 3 && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-studio-400 hover:text-gold-300 flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Date</span>
            </button>
            <span className="text-xs text-gold-400 font-medium">
              Date: {selectedDate}
            </span>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-gold-500/25">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gold-400" />
                  <span>Select Time Slot</span>
                </h3>
                <p className="text-xs text-studio-400">
                  Appointments from 10:30 AM to 8:30 PM (30-min intervals)
                </p>
              </div>

              <div className="flex items-center space-x-3 text-[10px]">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                  <span className="text-studio-300">Available</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-red-400/80"></span>
                  <span className="text-studio-500">Booked</span>
                </div>
              </div>
            </div>

            {loadingSlots ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-studio-400">Querying live slot availability from database...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                {slots.map((slot) => {
                  const isSelected = selectedSlot === slot.time;
                  const isBooked = slot.isBooked;

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={isBooked}
                      onClick={() => {
                        setSelectedSlot(slot.time);
                        setBookingError(null);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center ${
                        isBooked
                          ? 'bg-red-950/20 border-red-900/30 text-studio-600 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-studio-950 font-bold border-gold-400 shadow-glow-gold scale-105'
                          : 'bg-studio-900 border-studio-800 text-studio-200 hover:border-gold-500/40 hover:bg-studio-850'
                      }`}
                    >
                      <span className="text-xs font-semibold">{slot.time}</span>
                      {isBooked ? (
                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider mt-0.5">
                          Booked
                        </span>
                      ) : (
                        <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-studio-900 font-bold' : 'text-gold-500/80'}`}>
                          Available
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedSlot && (
            <div className="p-3.5 bg-studio-900 border border-gold-500/25 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-gold-400" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-studio-400 font-bold block">
                    Selected Appointment Slot
                  </span>
                  <span className="text-sm font-bold text-gold-300">
                    {selectedDate} at {selectedSlot}
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-gold-400" />
            </div>
          )}

          <button
            type="button"
            disabled={!selectedSlot}
            onClick={() => setStep(4)}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold py-3.5 px-6 rounded-xl shadow-glow-gold flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
          >
            <span>Proceed to Customer Details</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      )}

      {/* STEP 4: CUSTOMER DETAILS */}
      {step === 4 && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-xs text-studio-400 hover:text-gold-300 flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Time Slots</span>
            </button>
            <span className="text-xs text-gold-400 font-medium">
              Slot: {selectedDate} ({selectedSlot})
            </span>
          </div>

          {!customer && (
            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-200 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <User className="w-4 h-4 text-amber-400" />
                <span>You are booking as a guest. Please sign in or confirm your details below.</span>
              </div>
              <button
                type="button"
                onClick={onRequireAuth}
                className="text-xs font-bold text-amber-400 hover:underline shrink-0 ml-2"
              >
                Sign In
              </button>
            </div>
          )}

          <div className="glass-panel p-5 rounded-3xl border border-gold-500/25 space-y-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-gold-400" />
              <span>Customer Details</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-studio-300 mb-1.5 uppercase tracking-wider">
                Customer Name <span className="text-gold-400">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-studio-950 border border-studio-750 focus:border-gold-500 rounded-xl px-4 py-2.5 text-sm text-studio-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-studio-300 mb-1.5 uppercase tracking-wider">
                Phone Number <span className="text-gold-400">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center space-x-1 text-studio-400 text-xs font-semibold border-r border-studio-750 pr-2">
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full bg-studio-950 border border-studio-750 focus:border-gold-500 rounded-xl pl-20 pr-4 py-2.5 text-sm text-studio-100 outline-none"
                />
              </div>
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
                placeholder="Email address for booking acknowledgement"
                className="w-full bg-studio-950 border border-studio-750 focus:border-gold-500 rounded-xl px-4 py-2.5 text-sm text-studio-100 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-studio-300 uppercase tracking-wider">
                  Special Notes / Photoshoot Requirements
                </label>
                <span className="text-[10px] text-studio-500">Optional</span>
              </div>
              <textarea
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. 2 outfit changes, outdoor sunset preference, specific family members attending..."
                className="w-full bg-studio-950 border border-studio-750 focus:border-gold-500 rounded-xl px-4 py-2.5 text-sm text-studio-100 outline-none resize-none"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!customerName.trim() || !phoneNumber.trim()}
            onClick={() => setStep(5)}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold py-3.5 px-6 rounded-xl shadow-glow-gold flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
          >
            <span>Proceed to Payment Options</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      )}

      {/* STEP 5: PAYMENT OPTIONS & FINAL SUMMARY REVIEW */}
      {step === 5 && (
        <form onSubmit={handleFinalSubmit} className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="text-xs text-studio-400 hover:text-gold-300 flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Details</span>
            </button>
            <span className="text-xs text-gold-400 font-semibold">
              Payment Selection
            </span>
          </div>

          {/* PAYMENT OPTIONS SELECTION */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-studio-300 mb-3">
              Choose Payment Method
            </label>

            <div className="space-y-3.5">
              {/* OPTION 1: Pay Before Shoot (20% OFF) */}
              <div
                onClick={() => setPaymentMethod('pay_advance')}
                className={`relative p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'pay_advance'
                    ? 'bg-studio-850 border-gold-500 shadow-glow-gold'
                    : 'bg-studio-900 border-studio-800 hover:border-gold-500/40'
                }`}
              >
                {/* 20% OFF Gold Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-gold-500 to-amber-300 text-studio-950 font-extrabold text-[11px] px-3 py-1 rounded-full shadow">
                    <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>20% ADVANCE DISCOUNT</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-gold-500">
                    {paymentMethod === 'pay_advance' && <div className="w-2.5 h-2.5 rounded-full bg-gold-400"></div>}
                  </div>
                </div>

                <h4 className="font-serif text-lg font-bold text-white mb-0.5">
                  Option 1: Pay Before Shoot
                </h4>
                <p className="text-xs text-gold-300 font-semibold mb-3">
                  Pay in Advance & Save 20% on Your Photoshoot!
                </p>

                {/* Price Breakdown Preview */}
                <div className="p-3 bg-studio-950 rounded-xl border border-studio-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-studio-500 block">Original</span>
                    <span className="line-through text-studio-400 font-mono">₹{pricing.originalAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 block font-bold">You Save</span>
                    <span className="text-emerald-400 font-bold font-mono">-₹{pricing.discountAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gold-400 block font-bold">Pay Today</span>
                    <span className="text-base text-gold-300 font-bold font-mono">₹{pricing.finalPayableAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* OPTION 2: Pay After Shoot (No Discount) */}
              <div
                onClick={() => setPaymentMethod('pay_later')}
                className={`relative p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'pay_later'
                    ? 'bg-studio-850 border-gold-500 shadow-glow-gold'
                    : 'bg-studio-900 border-studio-800 hover:border-gold-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center space-x-1.5 bg-studio-800 border border-studio-700 text-studio-300 font-bold text-[11px] px-3 py-1 rounded-full">
                    <Banknote className="w-3.5 h-3.5" />
                    <span>PAY AT STUDIO</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-studio-700">
                    {paymentMethod === 'pay_later' && <div className="w-2.5 h-2.5 rounded-full bg-gold-400"></div>}
                  </div>
                </div>

                <h4 className="font-serif text-lg font-bold text-white mb-0.5">
                  Option 2: Pay After Shoot
                </h4>
                <p className="text-xs text-studio-400 mb-3">
                  Enjoy Your Photoshoot Now & Pay After Completion.
                </p>

                <div className="p-3 bg-studio-950 rounded-xl border border-studio-800/80 flex items-center justify-between text-xs">
                  <span className="text-studio-400">Total Payable at Studio:</span>
                  <span className="text-base text-white font-bold font-mono">₹{pricing.originalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DEDICATED UPI QR CODE & PAYMENT VERIFICATION SECTION (If Advance Selected) */}
          {paymentMethod === 'pay_advance' && (
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-gold-500/35 space-y-5 animate-slide-up">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-studio-800">
                <QrCode className="w-5 h-5 text-gold-400" />
                <div>
                  <h3 className="font-serif text-base font-bold text-white">
                    Scan & Pay via Studio UPI QR Code
                  </h3>
                  <p className="text-[11px] text-studio-400">
                    Scan with Google Pay, PhonePe, Paytm, or any UPI Application.
                  </p>
                </div>
              </div>

              {/* QR Code and Exact Amount Container */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                {/* QR Code Preview */}
                <div className="p-3.5 bg-white rounded-2xl shadow-xl flex flex-col items-center shrink-0 border-2 border-gold-500/50">
                  {studioSettings.qrCodeUrl ? (
                    <img
                      src={studioSettings.qrCodeUrl}
                      alt="Nilesh Studio UPI QR Code"
                      className="w-48 h-48 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      QR Code Loading...
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-studio-950 uppercase tracking-widest mt-2">
                    {studioSettings.upiName}
                  </span>
                </div>

                {/* Amount & UPI Details Column */}
                <div className="flex-1 space-y-3.5 text-center sm:text-left w-full">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-studio-400 block">
                      Exact Payable Amount
                    </span>
                    <div className="font-mono text-3xl font-black text-gold-light-gradient">
                      ₹{pricing.finalPayableAmount.toLocaleString()}
                    </div>
                    <span className="inline-block text-[11px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded-full mt-1">
                      Includes 20% Advance Discount
                    </span>
                  </div>

                  {/* UPI ID Pill */}
                  <div className="p-2.5 bg-studio-950 rounded-xl border border-studio-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-studio-200 truncate mr-2">{studioSettings.upiId}</span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="text-[11px] font-bold text-gold-400 hover:text-gold-300 bg-studio-900 border border-gold-500/20 px-2.5 py-1 rounded-lg shrink-0 flex items-center space-x-1"
                    >
                      {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                    </button>
                  </div>

                  {/* Download QR Button */}
                  <button
                    type="button"
                    onClick={downloadQrCode}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 text-xs font-semibold text-studio-300 hover:text-white bg-studio-900 hover:bg-studio-850 border border-studio-750 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-gold-400" />
                    <span>Download QR Code</span>
                  </button>
                </div>
              </div>

              {/* Transaction ID & Screenshot Upload Form */}
              <div className="pt-4 border-t border-studio-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-studio-200 mb-1.5">
                    UPI Transaction ID / UTR Number <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required={paymentMethod === 'pay_advance'}
                    value={upiTransactionId}
                    onChange={(e) => setUpiTransactionId(e.target.value)}
                    placeholder="e.g. 432198765432 or UPI Ref / UTR"
                    className="w-full bg-studio-950 border border-studio-750 focus:border-gold-500 rounded-xl px-4 py-2.5 text-sm text-studio-100 font-mono outline-none"
                  />
                  <p className="text-[11px] text-studio-400 mt-1">
                    Enter the 12-digit UTR or Transaction ID shown in your Google Pay, PhonePe, or Paytm receipt.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-studio-200">
                      Payment Screenshot
                    </label>
                    <span className="text-[10px] text-studio-500">Optional</span>
                  </div>
                  <label className="w-full flex items-center justify-center border-2 border-dashed border-studio-750 hover:border-gold-500/50 bg-studio-950/60 rounded-xl p-3 cursor-pointer transition-colors text-xs text-studio-400 hover:text-studio-200">
                    <UploadCloud className="w-4 h-4 text-gold-400 mr-2" />
                    <span>{screenshotFileName || 'Upload Payment Receipt Screenshot (PNG, JPG)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* STRICTLY NON-REFUNDABLE CANCELLATION POLICY ACKNOWLEDGEMENT */}
              <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-xs space-y-2.5">
                <div className="flex items-center space-x-2 text-amber-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Important Non-Refundable Advance Payment Policy</span>
                </div>
                <p className="text-[11px] text-studio-300 leading-relaxed">
                  To offer the exclusive <strong>20% discount</strong>, advance bookings reserve our dedicated studio floor, cinema-grade camera rigs, and lighting technicians. <strong>Advance payments are strictly NON-REFUNDABLE</strong> if you choose to cancel your appointment.
                </p>

                <label className="flex items-start space-x-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policyAcknowledged}
                    onChange={(e) => setPolicyAcknowledged(e.target.checked)}
                    className="w-4 h-4 rounded border-studio-700 bg-studio-950 text-gold-500 focus:ring-gold-500 mt-0.5"
                  />
                  <span className="text-[11px] text-amber-200 font-semibold select-none">
                    I have read, understand, and agree to the non-refundable advance payment policy.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* FINAL BOOKING SUMMARY REVIEW */}
          <div className="glass-card-gold p-5 rounded-3xl border border-gold-500/35">
            <div className="flex items-center justify-between border-b border-studio-800 pb-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                Final Booking & Payment Summary
              </span>
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                Status: Pending Confirmation
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-studio-800/60">
                <span className="text-studio-400">Service</span>
                <span className="font-bold text-white text-right">
                  {selectedCategory.title}
                  {selectedSubcatId && (
                    <span className="text-gold-300 block text-[11px]">
                      {selectedCategory.subcategories?.find(s => s.id === selectedSubcatId)?.title}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-studio-800/60">
                <span className="text-studio-400">Date & Time Slot</span>
                <span className="font-semibold text-studio-100">{selectedDate} at {selectedSlot}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-studio-800/60">
                <span className="text-studio-400">Payment Option</span>
                <span className="font-semibold text-white">
                  {paymentMethod === 'pay_advance' ? 'Pay Before Shoot (20% Advance Discount)' : 'Pay After Shoot'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-studio-800/60">
                <span className="text-studio-400">Original Amount</span>
                <span className="font-mono text-studio-300">₹{pricing.originalAmount.toLocaleString()}</span>
              </div>

              {paymentMethod === 'pay_advance' && (
                <div className="flex justify-between py-1 border-b border-studio-800/60 text-emerald-400">
                  <span>Advance Discount (20%)</span>
                  <span className="font-mono font-bold">-₹{pricing.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between py-1.5 font-bold">
                <span className="text-gold-400 text-sm">Final Amount</span>
                <span className="text-base text-gold-300 font-mono">₹{pricing.finalPayableAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-1 pt-2 border-t border-studio-800/60 text-[11px]">
                <span className="text-studio-400">Initial Payment Status</span>
                <span className="font-bold text-amber-400">
                  {paymentMethod === 'pay_advance' ? 'Verification Pending' : 'Pay After Shoot'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-extrabold py-4 px-6 rounded-xl shadow-glow-gold flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-studio-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Booking & Payment Request...</span>
              </div>
            ) : (
              <>
                <span>Submit Booking & Payment Details</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
