import {
  Category,
  GalleryItem,
  TimeSlot,
  Booking,
  Customer,
  CreateBookingPayload,
  StudioPaymentSettings,
  ServicePricingBreakdown
} from './types';

const API_BASE = '/api';

export const api = {
  // Studio Payment Settings (UPI QR Code, UPI ID)
  async getPaymentSettings(): Promise<StudioPaymentSettings> {
    const res = await fetch(`${API_BASE}/payment/settings`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load payment settings');
    }
    return data.settings;
  },

  // Calculate pricing & discount
  async getPricing(categoryId: string, subcategoryId?: string, paymentMethod = 'pay_advance'): Promise<ServicePricingBreakdown> {
    let url = `${API_BASE}/payment/pricing?categoryId=${encodeURIComponent(categoryId)}&paymentMethod=${encodeURIComponent(paymentMethod)}`;
    if (subcategoryId) {
      url += `&subcategoryId=${encodeURIComponent(subcategoryId)}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to calculate pricing');
    }
    return data.pricing;
  },

  // Authentication / Profile
  async registerOrLogin(fullName: string, phoneNumber: string, email?: string): Promise<Customer> {
    const res = await fetch(`${API_BASE}/auth/register-or-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phoneNumber, email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register or login');
    }
    return data.customer;
  },

  async getCustomerByPhone(phoneNumber: string): Promise<Customer> {
    const res = await fetch(`${API_BASE}/auth/customer/${encodeURIComponent(phoneNumber)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Customer not found');
    }
    return data.customer;
  },

  async updateCustomer(id: string, fullName: string, email?: string): Promise<Customer> {
    const res = await fetch(`${API_BASE}/auth/customer/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }
    return data.customer;
  },

  // Categories & Galleries
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load categories');
    }
    return data.categories;
  },

  async getGallery(categoryId: string, subcategoryId?: string): Promise<GalleryItem[]> {
    let url = `${API_BASE}/gallery?categoryId=${encodeURIComponent(categoryId)}`;
    if (subcategoryId) {
      url += `&subcategoryId=${encodeURIComponent(subcategoryId)}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load gallery items');
    }
    return data.items;
  },

  // Slot Availability
  async getSlotAvailability(date: string): Promise<TimeSlot[]> {
    const res = await fetch(`${API_BASE}/slots/availability?date=${encodeURIComponent(date)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to check slot availability');
    }
    return data.slots;
  },

  // Bookings
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit booking request');
    }
    return data.booking;
  },

  async getCustomerBookings(customerId: string, phoneNumber?: string): Promise<Booking[]> {
    let url = `${API_BASE}/bookings/customer/${encodeURIComponent(customerId)}`;
    if (phoneNumber) {
      url += `?phone=${encodeURIComponent(phoneNumber)}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch bookings');
    }
    return data.bookings;
  },

  async cancelBooking(bookingId: string, customerId: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to cancel booking');
    }
    return data.booking;
  },
};
