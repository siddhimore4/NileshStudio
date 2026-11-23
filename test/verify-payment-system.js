import {
  getDb,
  registerOrLoginCustomer,
  calculatePricing,
  createBooking,
  getStudioPaymentSettings,
  updateStudioPaymentSettings,
  verifyPaymentAdmin,
  rejectPaymentAdmin,
  markPaidAfterShootAdmin,
  getAllBookingsAdmin
} from '../server/db.js';

async function runPaymentTests() {
  console.log('--- STARTING NILESH STUDIO PAYMENT SYSTEM VERIFICATION ---');

  await getDb();
  console.log('✓ Database connected and schema loaded.');

  // Test 1: Pricing and 20% Discount Calculation
  const advancePricing = calculatePricing('outdoor', 'maternity', 'pay_advance');
  console.log('Advance Pricing:', advancePricing);
  if (advancePricing.discountPercentage !== 20) throw new Error('Expected 20% discount');
  if (advancePricing.discountAmount !== Math.round(advancePricing.originalAmount * 0.20)) throw new Error('Discount amount calculation mismatch');
  if (advancePricing.finalPayableAmount !== advancePricing.originalAmount - advancePricing.discountAmount) throw new Error('Final payable amount mismatch');

  const laterPricing = calculatePricing('outdoor', 'maternity', 'pay_later');
  console.log('Pay After Shoot Pricing:', laterPricing);
  if (laterPricing.discountPercentage !== 0 || laterPricing.discountAmount !== 0) throw new Error('Pay After Shoot should not have discount');
  if (laterPricing.finalPayableAmount !== laterPricing.originalAmount) throw new Error('Pay After Shoot should equal original amount');
  console.log('✓ Verified: 20% advance discount and full price pay-later calculations are accurate.');

  // Test 2: Studio Payment Settings & QR Code
  const initialSettings = getStudioPaymentSettings();
  console.log(`✓ Studio Settings: UPI ID = ${initialSettings.upiId}, Name = ${initialSettings.upiName}, QR Code length = ${initialSettings.qrCodeUrl.length}`);
  if (!initialSettings.qrCodeUrl.startsWith('data:image/svg+xml')) throw new Error('Default studio QR code should exist');

  // Test 3: Create Customer
  const customer = registerOrLoginCustomer({
    fullName: 'Ananya Deshmukh',
    phoneNumber: '9820011223',
    email: 'ananya@example.com'
  });

  // Test 4: Advance Payment Booking (Option 1)
  const testDate = '2026-12-28';
  const testSlot = '11:30 AM';
  const testUtr = 'UPI/UTR/847291048201';

  const advanceBooking = createBooking({
    customerId: customer.id,
    customerName: customer.fullName,
    phoneNumber: customer.phoneNumber,
    email: customer.email,
    categoryId: 'indoor',
    categoryName: 'Indoor Studio',
    subcategoryId: 'maternity',
    subcategoryName: 'Maternity Photography',
    bookingDate: testDate,
    timeSlot: testSlot,
    paymentMethod: 'pay_advance',
    upiTransactionId: testUtr,
    paymentScreenshotUrl: 'data:image/png;base64,sampleScreenshotData123'
  });

  console.log(`✓ Advance Booking created: ID = ${advanceBooking.id}`);
  console.log(`  - Original Amount: ₹${advanceBooking.original_amount}`);
  console.log(`  - Discount (20%): -₹${advanceBooking.discount_amount}`);
  console.log(`  - Final Payable: ₹${advanceBooking.final_payable_amount}`);
  console.log(`  - Payment Status: ${advanceBooking.payment_status} (Expected: Verification Pending)`);
  console.log(`  - Booking Status: ${advanceBooking.status} (Expected: Pending)`);
  console.log(`  - Submitted UTR: ${advanceBooking.upi_transaction_id}`);

  if (advanceBooking.payment_status !== 'Verification Pending') throw new Error('Expected payment status Verification Pending');
  if (advanceBooking.discount_percentage !== 20) throw new Error('Expected discount percentage 20');
  if (advanceBooking.upi_transaction_id !== testUtr) throw new Error('UTR mismatch');

  // Test 5: Pay After Shoot Booking (Option 2)
  const laterDate = '2026-12-29';
  const laterSlot = '4:00 PM';

  const laterBooking = createBooking({
    customerId: customer.id,
    customerName: customer.fullName,
    phoneNumber: customer.phoneNumber,
    categoryId: 'wedding',
    categoryName: 'Wedding Photography',
    bookingDate: laterDate,
    timeSlot: laterSlot,
    paymentMethod: 'pay_later'
  });

  console.log(`✓ Pay After Shoot Booking created: ID = ${laterBooking.id}`);
  console.log(`  - Original Amount: ₹${laterBooking.original_amount}`);
  console.log(`  - Discount: ₹${laterBooking.discount_amount}`);
  console.log(`  - Final Payable: ₹${laterBooking.final_payable_amount}`);
  console.log(`  - Payment Status: ${laterBooking.payment_status} (Expected: Pay After Shoot)`);

  if (laterBooking.payment_status !== 'Pay After Shoot') throw new Error('Expected payment status Pay After Shoot');
  if (laterBooking.discount_amount !== 0) throw new Error('Pay After Shoot must not have a discount');

  // Test 6: Business Owner Manual Payment Verification
  console.log('Testing Business Owner verification...');
  const verifiedBooking = verifyPaymentAdmin(advanceBooking.id, 'Studio Owner Nilesh');
  console.log(`✓ Payment verified! Status: ${verifiedBooking.payment_status}, Verified By: ${verifiedBooking.payment_verified_by}, Date: ${verifiedBooking.payment_verification_date}`);
  if (verifiedBooking.payment_status !== 'Paid') throw new Error('Expected payment status Paid after verification');

  // Test 7: Business Owner Rejection
  const rejectedBooking = rejectPaymentAdmin(advanceBooking.id, 'UTR not matching bank credit statement', 'Studio Owner Nilesh');
  console.log(`✓ Payment rejected! Status: ${rejectedBooking.payment_status}, Reason: ${rejectedBooking.payment_rejection_reason}`);
  if (rejectedBooking.payment_status !== 'Payment Rejected') throw new Error('Expected status Payment Rejected');

  // Test 8: Business Owner Mark Paid After Shoot
  const paidLaterBooking = markPaidAfterShootAdmin(laterBooking.id, 'Studio Owner Nilesh');
  console.log(`✓ Pay After Shoot marked Paid! Status: ${paidLaterBooking.payment_status}`);
  if (paidLaterBooking.payment_status !== 'Paid') throw new Error('Expected status Paid');

  // Test 9: Studio Owner Uploading / Changing Custom QR Code
  const customQr = 'data:image/png;base64,CUSTOM_STUDIO_UPLOADED_QR_CODE_DATA';
  const updatedSettings = updateStudioPaymentSettings({
    qrCodeUrl: customQr,
    upiId: 'nileshphotos@okhdfcbank',
    upiName: 'Nilesh Photography Studio'
  });
  console.log(`✓ Studio QR Code updated! New UPI ID: ${updatedSettings.upiId}, Name: ${updatedSettings.upiName}`);
  if (updatedSettings.upiId !== 'nileshphotos@okhdfcbank' || updatedSettings.qrCodeUrl !== customQr) {
    throw new Error('Failed to update studio QR code settings');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL PAYMENT & QR CODE SYSTEM TESTS PASSED PERFECTLY!');
  console.log('======================================================\n');
}

runPaymentTests().catch(err => {
  console.error('❌ Payment test failed:', err);
  process.exit(1);
});
