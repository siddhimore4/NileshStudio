# Nilesh Studio — Mobile Photography & Photoshoot Booking Application

A modern, visually stunning mobile-first web application built for **Nilesh Studio**, a premier photography and photoshoot booking business.

This application allows customers to explore fine art photography services, view sample galleries with high-resolution lightbox previews, check real-time date & time slot availability, and reserve appointments with guaranteed concurrency protection against double-booking.

---

## 🌟 Key Features

### 1. Welcome & Friction-Free Registration / Login
- Elegant luxury studio branding with aperture emblem and gold foil typography.
- Simple registration collecting:
  - **Full Name** (Required)
  - **Phone Number** (Required, 10-digit validation)
  - **Email Address** (Optional)
- **No OTP verification**: Instant, user-friendly access.
- **No passwords**: Frictionless phone-number-based recognition for returning customers.
- Secure customer profiles stored permanently in the database and cached for seamless return visits.
- Immediate redirect to the Home Page upon registration.

### 2. Home Page
- Prominent Nilesh Studio branding & tagline: *"Capturing Timeless Stories & Raw Emotion"*.
- Four main photography categories:
  1. **Indoor Studio**
  2. **Outdoor Shoots**
  3. **Wedding Photography**
  4. **Pre-Wedding Shoots**
- Each category features:
  - High-resolution editorial cover image.
  - Category title & subtitle.
  - Curated service description.
  - Clickable card linking directly to the respective category page.
  - Direct "Book Slot" quick action.
- Studio metrics: 10+ Years Heritage, 5,000+ Moments Preserved, 4.9★ Customer Satisfaction.

### 3. Indoor and Outdoor Categories
Inside **both** Indoor and Outdoor categories, 4 dedicated subcategories are included:
1. **Birthday Shoots**
2. **Maternity Photography**
3. **Festive Photography**
4. **Newborn Photography**

For each subcategory:
- 3–4 high-resolution photo thumbnails.
- Interactive tap-to-expand lightbox preview with zoom and metadata.
- Clear **"Book Now"** button that pre-selects the category and subcategory in the booking system.
- Thumbnails stored and managed via the backend database for easy replacement.

### 4. Wedding & Pre-Wedding Categories
- Dedicated royal & destination presentation.
- 3–4 sample wedding/pre-wedding photography thumbnails with full lightbox previews.
- Brief service descriptions highlighting candid shots, royal aesthetic, drone cinematography, and heirloom albums.
- Prominent **"Book Now"** action.

### 5. Real-Time Slot Booking System (Core Feature)
- **Step 1: Photography Service Selection**:
  - Choose Indoor, Outdoor, Wedding, or Pre-Wedding with instant subcategory filtering.
- **Step 2: Interactive Date Selection**:
  - Interactive calendar with month & year navigation.
  - Past dates strictly disabled and unselectable.
- **Step 3 & 4: Time Slot Selection & Real-Time Availability**:
  - All 21 standard 30-minute intervals from **10:30 AM to 8:30 PM**:
    `10:30 AM`, `11:00 AM`, `11:30 AM`, `12:00 PM`, `12:30 PM`, `1:00 PM`, `1:30 PM`, `2:00 PM`, `2:30 PM`, `3:00 PM`, `3:30 PM`, `4:00 PM`, `4:30 PM`, `5:00 PM`, `5:30 PM`, `6:00 PM`, `6:30 PM`, `7:00 PM`, `7:30 PM`, `8:00 PM`, `8:30 PM`.
  - **Dynamic real-time database query**: Every date change immediately queries live bookings.
  - Booked slots are displayed as **BOOKED** and disabled from selection.
  - Available slots are clearly highlighted in gold.
  - **Double-booking prevention**: Transactional concurrency check rejects concurrent duplicate bookings with HTTP 409 Conflict.
- **Step 5: Customer Details & Confirmation**:
  - Pre-filled customer name, phone number, and optional email.
  - Special requirements / photoshoot notes textarea.
  - Complete booking summary card before final submission.
  - Generates a unique booking ID (e.g., `NS-20261122-8492`).
  - Canvas confetti celebration!
  - Booking request acknowledgement with real-time status **Pending**.

### 6. Booking Status Lifecycle
- **Pending**: Initial status for all new customer booking requests.
- **Confirmed**: Studio owner confirms the slot via the business portal.
- **Completed**: Photoshoot session completed.
- **Cancelled**: Booking cancelled (immediately frees up the slot for other customers).

### 7. Customer Profile & Private Booking History
- Customer avatar with initials, phone number, and email.
- Profile edit option (update name, email) saved to the database.
- Private "My Bookings" list:
  - Upcoming vs. Past appointment filters.
  - Status badges with visual color codes.
  - Customer can cancel pending bookings with confirmation modal.
  - Complete privacy: Customers never see any other customer's bookings.

### 8. Database Architecture & Concurrency
- Permanent on-disk SQLite database (`data/nilesh_studio.sqlite`).
- Structured tables:
  - `customers`
  - `categories`
  - `subcategories`
  - `gallery_items`
  - `time_slots`
  - `bookings`
- Atomic SQL transactions and unique constraint validation preventing double bookings.

### 9. Complete Separation of Customer App & Business Portal
- **Customer App**: Clean, luxury, 100% customer-facing. Zero business or admin login buttons.
- **Business Portal**: Completely independent system accessible at `http://localhost:5000/business/`.
  - Real-time studio KPI metrics (total bookings, pending approvals, confirmed, completed).
  - Search and filter by status and date.
  - One-click status management (Approve/Confirm, Mark Completed, Cancel).

---

## 🚀 Running the Application

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
The server will start on port `5000`:
- **Customer Mobile Application**: [http://localhost:5000/](http://localhost:5000/)
- **Studio Owner Business Portal**: [http://localhost:5000/business/](http://localhost:5000/business/)

### 3. Run Automated System Tests
To run the automated verification suite (12 tests verifying categories, subcategories, gallery items, registration, slot booking, concurrency protection, double-booking rejection, past date blocking, privacy isolation, and business management):
```bash
node test/verify-system.js
```

---

## 📱 Mobile Frame Preview
On desktop, the application includes a top switcher allowing you to toggle between:
- **Mobile Frame**: Renders the application inside a simulated smartphone viewport with bezels and status bar.
- **Full Viewport**: Expands the application to responsive desktop layout.
On real mobile devices, it automatically adapts edge-to-edge.
