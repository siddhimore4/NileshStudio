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

export const DEFAULT_PRODUCTION_BACKEND = 'https://nilesh-studio-app.onrender.com';

export function getApiBase(): string {
  // 1. Explicit env variable (VITE_API_BASE_URL)
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.replace(/\/$/, '') + '/api';
  }

  // 2. Custom override stored in localStorage
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('nds_api_base');
    if (custom && custom.trim() !== '') {
      return custom.replace(/\/$/, '') + '/api';
    }
  }

  // 3. Local Vite development server (with proxy to :5000)
  if (typeof window !== 'undefined') {
    const isLocalDev = window.location.hostname === 'localhost' &&
      (window.location.port === '3000' || window.location.port === '5173');
    if (isLocalDev) {
      return '/api';
    }

    // Direct access if hosted on the same backend domain
    if (window.location.origin === DEFAULT_PRODUCTION_BACKEND) {
      return '/api';
    }
  }

  // 4. In all other environments (Android native APK, iOS, mobile browsers, deployed web):
  // Connect to permanent HTTPS production backend
  return `${DEFAULT_PRODUCTION_BACKEND}/api`;
}

async function fetchJson<T = any>(endpointOrUrl: string, options?: RequestInit): Promise<T> {
  const base = getApiBase();
  const url = (endpointOrUrl.startsWith('http://') || endpointOrUrl.startsWith('https://'))
    ? endpointOrUrl
    : (endpointOrUrl.startsWith('/api')
      ? `${base.replace(/\/api$/, '')}${endpointOrUrl}`
      : `${base}${endpointOrUrl.startsWith('/') ? '' : '/'}${endpointOrUrl}`);

  let res: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(`Connection timed out while reaching studio backend (${url}). Please check your internet connection.`);
    }
    throw new Error(`Unable to connect to studio server (${url}). Backend may be offline or deploying.`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Studio server returned an HTML page instead of API data (HTTP ${res.status}). The cloud backend (${DEFAULT_PRODUCTION_BACKEND}) may still be deploying or offline.`
    );
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Invalid JSON received from studio server.`);
  }

  if (!res.ok) {
    throw new Error(data?.error || `Server error (HTTP ${res.status})`);
  }
  return data;
}

const API_BASE = '/api';

export const api = {
  // Studio Payment Settings (UPI QR Code, UPI ID)
  async getPaymentSettings(): Promise<StudioPaymentSettings> {
    const data = await fetchJson(`${API_BASE}/payment/settings`);
    return data.settings;
  },

  // Calculate pricing & discount
  async getPricing(categoryId: string, subcategoryId?: string, paymentMethod = 'pay_advance'): Promise<ServicePricingBreakdown> {
    let url = `${API_BASE}/payment/pricing?categoryId=${encodeURIComponent(categoryId)}&paymentMethod=${encodeURIComponent(paymentMethod)}`;
    if (subcategoryId) {
      url += `&subcategoryId=${encodeURIComponent(subcategoryId)}`;
    }
    const data = await fetchJson(url);
    return data.pricing;
  },

  // Authentication / Profile
  async registerOrLogin(fullName: string, phoneNumber: string, email?: string): Promise<Customer> {
    const data = await fetchJson(`${API_BASE}/auth/register-or-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phoneNumber, email }),
    });
    return data.customer;
  },

  async getCustomerByPhone(phoneNumber: string): Promise<Customer> {
    const data = await fetchJson(`${API_BASE}/auth/customer/${encodeURIComponent(phoneNumber)}`);
    return data.customer;
  },

  async updateCustomer(id: string, fullName: string, email?: string): Promise<Customer> {
    const data = await fetchJson(`${API_BASE}/auth/customer/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email }),
    });
    return data.customer;
  },

  // Categories & Galleries
  async getCategories(): Promise<Category[]> {
    const data = await fetchJson(`${API_BASE}/categories`);
    return data.categories;
  },

  async getGallery(categoryId: string, subcategoryId?: string): Promise<GalleryItem[]> {
    let url = `${API_BASE}/gallery?categoryId=${encodeURIComponent(categoryId)}`;
    if (subcategoryId) {
      url += `&subcategoryId=${encodeURIComponent(subcategoryId)}`;
    }
    const data = await fetchJson(url);
    return data.items;
  },

  // Slot Availability
  async getSlotAvailability(date: string): Promise<TimeSlot[]> {
    const data = await fetchJson(`${API_BASE}/slots/availability?date=${encodeURIComponent(date)}`);
    return data.slots;
  },

  // Bookings
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const data = await fetchJson(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.booking;
  },

  async getCustomerBookings(customerId: string, phoneNumber?: string): Promise<Booking[]> {
    let url = `${API_BASE}/bookings/customer/${encodeURIComponent(customerId)}`;
    if (phoneNumber) {
      url += `?phone=${encodeURIComponent(phoneNumber)}`;
    }
    const data = await fetchJson(url);
    return data.bookings;
  },

  async cancelBooking(bookingId: string, customerId: string): Promise<Booking> {
    const data = await fetchJson(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });
    return data.booking;
  },
};
