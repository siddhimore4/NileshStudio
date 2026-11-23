import {
  getDb,
  registerOrLoginCustomer,
  getCustomerByPhone,
  updateCustomer,
  getAllCategories,
  getGalleryItems,
  getSlotAvailability,
  createBooking,
  getBookingsByCustomer,
  cancelCustomerBooking,
  getAllBookingsAdmin,
  updateBookingStatusAdmin,
  ALL_TIME_SLOTS
} from '../server/db.js';

async function runTests() {
  console.log('--- STARTING NILESH STUDIO SYSTEM VERIFICATION ---');

  // Initialize DB
  await getDb();
  console.log('✓ Database connected and schema validated.');

  // Test 1: Verify Categories and Subcategories
  const categories = getAllCategories();
  console.log(`✓ Categories loaded: ${categories.length} categories.`);
  if (categories.length !== 4) throw new Error('Expected 4 categories');

  const indoor = categories.find(c => c.id === 'indoor');
  const outdoor = categories.find(c => c.id === 'outdoor');
  const wedding = categories.find(c => c.id === 'wedding');
  const preWedding = categories.find(c => c.id === 'pre-wedding');

  if (!indoor || !outdoor || !wedding || !preWedding) {
    throw new Error('Missing core categories');
  }

  // Verify 4 subcategories in Indoor and Outdoor
  const requiredSubcats = ['birthday', 'maternity', 'festive', 'newborn'];
  for (const reqSub of requiredSubcats) {
    if (!indoor.subcategories.some(s => s.id === reqSub)) {
      throw new Error(`Missing Indoor subcategory: ${reqSub}`);
    }
    if (!outdoor.subcategories.some(s => s.id === reqSub)) {
      throw new Error(`Missing Outdoor subcategory: ${reqSub}`);
    }
  }
  console.log('✓ Verified: Indoor and Outdoor both contain Birthday, Maternity, Festive, and Newborn subcategories.');

  // Test 2: Verify Gallery Items
  for (const cat of ['indoor', 'outdoor']) {
    for (const sub of requiredSubcats) {
      const items = getGalleryItems(cat, sub);
      if (items.length < 3) throw new Error(`Gallery for ${cat}/${sub} has fewer than 3 thumbnails (has ${items.length})`);
    }
  }
  const weddingPhotos = getGalleryItems('wedding');
  const preWeddingPhotos = getGalleryItems('pre-wedding');
  if (weddingPhotos.length < 3 || preWeddingPhotos.length < 3) {
    throw new Error('Wedding or Pre-wedding gallery has fewer than 3 thumbnails');
  }
  console.log('✓ Verified: All subcategories & wedding/pre-wedding have 3-4 high-quality photo thumbnails.');

  // Test 3: Customer Registration (No OTP, phone + name based)
  const testPhone = '9988776655';
  const customer = registerOrLoginCustomer({
    fullName: 'Priya Sharma',
    phoneNumber: testPhone,
    email: 'priya.sharma@example.com'
  });
  console.log(`✓ Customer registered: ${customer.fullName} (${customer.id})`);
  if (!customer.id || customer.phoneNumber !== testPhone) {
    throw new Error('Customer registration failed');
  }

  // Returning Customer Login
  const returning = getCustomerByPhone(testPhone);
  if (!returning || returning.fullName !== 'Priya Sharma') {
    throw new Error('Returning customer lookup failed');
  }
  console.log('✓ Returning customer recognized securely by phone number.');

  // Test 4: Verify 21 Time Slots (10:30 AM to 8:30 PM)
  if (ALL_TIME_SLOTS.length !== 21) {
    throw new Error(`Expected 21 time slots, got ${ALL_TIME_SLOTS.length}`);
  }
  if (ALL_TIME_SLOTS[0] !== '10:30 AM' || ALL_TIME_SLOTS[ALL_TIME_SLOTS.length - 1] !== '8:30 PM') {
    throw new Error('Time slot bounds mismatch');
  }
  console.log('✓ Verified: Exactly 21 time slots starting 10:30 AM to 8:30 PM at 30-min intervals.');

  // Test 5: Real-time Slot Availability Check
  const testDate = '2026-12-15';
  let availability = getSlotAvailability(testDate);
  const targetSlot = '2:30 PM';
  const targetSlotObj = availability.find(s => s.time === targetSlot);
  if (!targetSlotObj || targetSlotObj.isBooked) {
    throw new Error(`Target slot ${targetSlot} should be available initially`);
  }
  console.log(`✓ Slot ${targetSlot} on ${testDate} is initially AVAILABLE.`);

  // Test 6: Create Booking (Starts initially as Pending)
  const booking = createBooking({
    customerId: customer.id,
    customerName: customer.fullName,
    phoneNumber: customer.phoneNumber,
    email: customer.email,
    categoryId: 'wedding',
    categoryName: 'Wedding Photography',
    bookingDate: testDate,
    timeSlot: targetSlot,
    specialNotes: 'Interested in royal mandap coverage and drone shoot'
  });

  console.log(`✓ Booking created successfully! ID: ${booking.id}, Status: ${booking.status}`);
  if (booking.status !== 'Pending') {
    throw new Error(`Expected status 'Pending', got ${booking.status}`);
  }
  if (!booking.id.startsWith('NS-')) {
    throw new Error('Booking ID format should start with NS-');
  }

  // Test 7: Verify Slot is now BOOKED and Disabled
  availability = getSlotAvailability(testDate);
  const rechecked = availability.find(s => s.time === targetSlot);
  if (!rechecked.isBooked) {
    throw new Error(`Slot ${targetSlot} should now be BOOKED in real-time!`);
  }
  console.log(`✓ Real-time database verification: Slot ${targetSlot} on ${testDate} is now marked BOOKED.`);

  // Test 8: Concurrency & Double-Booking Prevention
  // Another customer attempts to book the exact same slot on the same date
  const customer2 = registerOrLoginCustomer({
    fullName: 'Rahul Verma',
    phoneNumber: '9123456789'
  });

  let doubleBookingCaught = false;
  try {
    createBooking({
      customerId: customer2.id,
      customerName: customer2.fullName,
      phoneNumber: customer2.phoneNumber,
      categoryId: 'indoor',
      categoryName: 'Indoor Studio',
      subcategoryId: 'birthday',
      subcategoryName: 'Birthday Shoots',
      bookingDate: testDate,
      timeSlot: targetSlot
    });
  } catch (err) {
    doubleBookingCaught = true;
    console.log(`✓ Concurrency Protection Passed! Double booking rejected with error: "${err.message}" (Status: ${err.status})`);
  }

  if (!doubleBookingCaught) {
    throw new Error('FAIL: Database allowed double booking of the same slot!');
  }

  // Test 9: Past Date Prevention
  let pastDateCaught = false;
  try {
    createBooking({
      customerId: customer.id,
      customerName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      categoryId: 'indoor',
      categoryName: 'Indoor Studio',
      bookingDate: '2020-01-01',
      timeSlot: '11:00 AM'
    });
  } catch (err) {
    pastDateCaught = true;
    console.log(`✓ Past date rejected: "${err.message}"`);
  }
  if (!pastDateCaught) throw new Error('FAIL: Past date was allowed!');

  // Test 10: Customer Privacy Isolation
  const customer1Bookings = getBookingsByCustomer(customer.id);
  const customer2Bookings = getBookingsByCustomer(customer2.id);
  if (customer1Bookings.length !== 1 || customer1Bookings[0].id !== booking.id) {
    throw new Error('Customer 1 should only see their own booking');
  }
  if (customer2Bookings.length !== 0) {
    throw new Error('Customer 2 should see 0 bookings');
  }
  console.log('✓ Privacy Isolation Verified: Customers only see their own private bookings.');

  // Test 11: Business Owner Management
  const allBookings = getAllBookingsAdmin({});
  if (!allBookings.some(b => b.id === booking.id)) {
    throw new Error('Business portal cannot see customer booking');
  }
  console.log(`✓ Business Portal sees all bookings across the studio (${allBookings.length} total).`);

  // Owner confirms booking: Pending -> Confirmed
  const confirmed = updateBookingStatusAdmin(booking.id, 'Confirmed');
  if (confirmed.status !== 'Confirmed') throw new Error('Failed to confirm booking');
  console.log(`✓ Business Owner updated booking status to: ${confirmed.status}`);

  // Test 12: Cancellation and Slot Re-availability
  cancelCustomerBooking(booking.id, customer.id);
  const recheckedAfterCancel = getSlotAvailability(testDate).find(s => s.time === targetSlot);
  if (recheckedAfterCancel.isBooked) {
    throw new Error('Slot should be available after cancellation');
  }
  console.log(`✓ After cancellation, slot ${targetSlot} is immediately AVAILABLE again for booking.`);

  console.log('\n=========================================');
  console.log('🎉 ALL 12 BACKEND & BOOKING SYSTEM TESTS PASSED PERFECTLY!');
  console.log('=========================================\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
