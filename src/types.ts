export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  createdAt: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  title: string;
  description: string;
  cover_image: string;
  display_order: number;
}

export interface Category {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover_image: string;
  display_order: number;
  subcategories: Subcategory[];
}

export interface GalleryItem {
  id: string;
  category_id: string;
  subcategory_id?: string | null;
  image_url: string;
  title: string;
  aspect_ratio?: string;
  display_order?: number;
}

export interface TimeSlot {
  time: string;
  isBooked: boolean;
  date: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export type PaymentStatus = 'Not Paid' | 'Verification Pending' | 'Paid' | 'Payment Rejected' | 'Pay After Shoot';

export interface Booking {
  id: string;
  customer_id: string;
  customer_name: string;
  phone_number: string;
  email?: string | null;
  category_id: string;
  category_name: string;
  subcategory_id?: string | null;
  subcategory_name?: string | null;
  booking_date: string; // YYYY-MM-DD
  time_slot: string;    // e.g. "10:30 AM"
  special_notes?: string | null;
  status: BookingStatus;
  original_amount?: number;
  discount_percentage?: number;
  discount_amount?: number;
  final_payable_amount?: number;
  payment_method?: string;
  payment_status?: PaymentStatus;
  upi_transaction_id?: string | null;
  payment_screenshot_url?: string | null;
  payment_verification_date?: string | null;
  payment_verified_by?: string | null;
  payment_rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingPayload {
  customerId: string;
  customerName: string;
  phoneNumber: string;
  email?: string | null;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string | null;
  subcategoryName?: string | null;
  bookingDate: string;
  timeSlot: string;
  specialNotes?: string;
  paymentMethod?: 'pay_advance' | 'pay_later';
  upiTransactionId?: string;
  paymentScreenshotUrl?: string;
}

export interface StudioPaymentSettings {
  upiId: string;
  upiName: string;
  qrCodeUrl: string;
}

export interface ServicePricingBreakdown {
  originalAmount: number;
  discountPercentage: number;
  discountAmount: number;
  finalPayableAmount: number;
}
