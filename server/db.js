import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'nilesh_studio.sqlite');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;
let SQL = null;

// Save database to disk
function persist() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// All 21 required time slots from 10:30 AM to 8:30 PM at 30-min intervals
export const ALL_TIME_SLOTS = [
  '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM',
  '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM',
  '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
  '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM',
  '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM',
  '8:30 PM'
];

export async function getDb() {
  if (db) return db;

  SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  initSchema();
  seedInitialData();
  persist();
  return db;
}

function initSchema() {
  db.run(`
    -- Customers Table
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone_number TEXT NOT NULL UNIQUE,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Photography Categories Table
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      description TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );

    -- Subcategories Table (Indoor & Outdoor)
    CREATE TABLE IF NOT EXISTS subcategories (
      id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      PRIMARY KEY (id, category_id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- Photography Gallery / Thumbnails Table
    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      subcategory_id TEXT,
      image_url TEXT NOT NULL,
      title TEXT NOT NULL,
      aspect_ratio TEXT DEFAULT 'portrait',
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- Time Slots Table
    CREATE TABLE IF NOT EXISTS time_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_time TEXT NOT NULL UNIQUE,
      display_order INTEGER DEFAULT 0
    );

    -- Bookings Table
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      email TEXT,
      category_id TEXT NOT NULL,
      category_name TEXT NOT NULL,
      subcategory_id TEXT,
      subcategory_name TEXT,
      booking_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      special_notes TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    -- Blocked Slots Table (Studio owner manual slot locks / maintenance)
    CREATE TABLE IF NOT EXISTS blocked_slots (
      id TEXT PRIMARY KEY,
      block_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(block_date, time_slot)
    );

    -- Studio Settings Table (Studio UPI QR Code, UPI ID, etc.)
    CREATE TABLE IF NOT EXISTS studio_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Index for fast slot availability check and customer lookups
    CREATE INDEX IF NOT EXISTS idx_bookings_date_slot ON bookings (booking_date, time_slot, status);
    CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings (customer_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings (phone_number);
    CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots (block_date);
  `);

  // Migrate bookings table for payment system columns
  const colRes = db.exec("PRAGMA table_info(bookings)");
  const cols = new Set((colRes[0]?.values || []).map(r => r[1]));

  const neededCols = [
    { name: 'original_amount', def: 'REAL DEFAULT 0' },
    { name: 'discount_percentage', def: 'REAL DEFAULT 0' },
    { name: 'discount_amount', def: 'REAL DEFAULT 0' },
    { name: 'final_payable_amount', def: 'REAL DEFAULT 0' },
    { name: 'payment_method', def: "TEXT DEFAULT 'Pay After Shoot'" },
    { name: 'payment_status', def: "TEXT DEFAULT 'Not Paid'" },
    { name: 'upi_transaction_id', def: 'TEXT' },
    { name: 'payment_screenshot_url', def: 'TEXT' },
    { name: 'payment_verification_date', def: 'DATETIME' },
    { name: 'payment_verified_by', def: 'TEXT' },
    { name: 'payment_rejection_reason', def: 'TEXT' }
  ];

  for (const col of neededCols) {
    if (!cols.has(col.name)) {
      db.run(`ALTER TABLE bookings ADD COLUMN ${col.name} ${col.def}`);
    }
  }
}

function seedInitialData() {
  // Check if categories are seeded
  const catCheck = db.exec("SELECT COUNT(*) as count FROM categories");
  const count = catCheck[0]?.values[0][0] || 0;

  if (count === 0) {
    console.log("Seeding initial photography categories and gallery items...");

    // 1. Categories
    const categories = [
      {
        id: 'indoor',
        title: 'Indoor Studio',
        subtitle: 'Controlled Artistry & Dramatic Light',
        description: 'Meticulously crafted studio portraits with high-end strobe lighting, custom luxury backdrops, and creative creative direction.',
        cover_image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80',
        display_order: 1
      },
      {
        id: 'outdoor',
        title: 'Outdoor Shoots',
        subtitle: 'Golden Hour & Scenic Natural Splendor',
        description: 'Vibrant outdoor storytelling bathed in natural golden hour light, breathtaking heritage locations, and expansive scenic landscapes.',
        cover_image: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80',
        display_order: 2
      },
      {
        id: 'wedding',
        title: 'Wedding Photography',
        subtitle: 'Grandeur, Sacred Vows & Royal Elegance',
        description: 'Fine art documentation of royal celebrations, sacred rituals, authentic emotional candids, and heirloom visual memories that last generations.',
        cover_image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        display_order: 3
      },
      {
        id: 'pre-wedding',
        title: 'Pre-Wedding Shoots',
        subtitle: 'Cinematic Romance & Intimate Love Stories',
        description: 'Exclusive destination sessions capturing your unique chemistry against majestic palaces, picturesque sunsets, and romantic panoramas.',
        cover_image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
        display_order: 4
      }
    ];

    for (const c of categories) {
      db.run(
        "INSERT INTO categories (id, title, subtitle, description, cover_image, display_order) VALUES (?, ?, ?, ?, ?, ?)",
        [c.id, c.title, c.subtitle, c.description, c.cover_image, c.display_order]
      );
    }

    // 2. Subcategories for Indoor and Outdoor
    const subcats = [
      // Indoor Subcategories
      {
        id: 'birthday',
        category_id: 'indoor',
        title: 'Birthday Shoots',
        description: 'Joyful studio setups with themed balloon installations, custom props, and lively milestone portraits.',
        cover_image: '/images/indoor-birthday/birthday-1.jpg',
        display_order: 1
      },
      {
        id: 'maternity',
        category_id: 'indoor',
        title: 'Maternity Photography',
        description: 'Graceful fine-art portraits celebrating motherhood with radiant studio backdrops, silk drapes, and intimate lighting.',
        cover_image: '/images/indoor-maternity/indoor-maternity-2.jpg',
        display_order: 2
      },
      {
        id: 'festive',
        category_id: 'indoor',
        title: 'Festive Photography',
        description: 'Rich ethnic studio celebrations capturing traditional attire, warm brass diyas, and authentic cultural festivities.',
        cover_image: '/images/indoor-festive/indoor-festive-6.jpg',
        display_order: 3
      },
      {
        id: 'newborn',
        category_id: 'indoor',
        title: 'Newborn Photography',
        description: 'Gentle, safe, temperature-controlled baby portraits in soft organic knits, cozy nests, and heirloom poses.',
        cover_image: '/images/indoor-newborn/newborn-2.jpg',
        display_order: 4
      },

      // Outdoor Subcategories
      {
        id: 'birthday',
        category_id: 'outdoor',
        title: 'Birthday Shoots',
        description: 'Open-air birthday celebrations featuring garden picnics, balloon releases, and natural energetic laughter.',
        cover_image: '/images/outdoor-birthday/outdoor-birthday-1.jpg',
        display_order: 1
      },
      {
        id: 'maternity',
        category_id: 'outdoor',
        title: 'Maternity Photography',
        description: 'Sunset meadows, tranquil lakesides, and ethereal floral landscapes highlighting the beauty of impending motherhood.',
        cover_image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
        display_order: 2
      },
      {
        id: 'festive',
        category_id: 'outdoor',
        title: 'Festive Photography',
        description: 'Grand festive celebrations set against historic royal architecture, vibrant bazaars, and traditional outdoor lighting.',
        cover_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        display_order: 3
      },
      {
        id: 'newborn',
        category_id: 'outdoor',
        title: 'Newborn Photography',
        description: 'Serene natural daylight portraits with parents in soft botanical gardens and peaceful shaded outdoor groves.',
        cover_image: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=800&q=80',
        display_order: 4
      }
    ];

    for (const sc of subcats) {
      db.run(
        "INSERT INTO subcategories (id, category_id, title, description, cover_image, display_order) VALUES (?, ?, ?, ?, ?, ?)",
        [sc.id, sc.category_id, sc.title, sc.description, sc.cover_image, sc.display_order]
      );
    }

    // 3. Gallery Items (4 high quality photos per subcategory & category)
    const gallery = [
      // Indoor Birthday
      { id: 'ib-1', cat: 'indoor', sub: 'birthday', title: 'Happy Birthday Little Explorer', url: '/images/indoor-birthday/birthday-1.jpg' },
      { id: 'ib-2', cat: 'indoor', sub: 'birthday', title: 'Birthday Joy & Teddy Bear Picnic', url: '/images/indoor-birthday/birthday-2.jpg' },
      { id: 'ib-3', cat: 'indoor', sub: 'birthday', title: 'Vintage Scooter Milestone Ride', url: '/images/indoor-birthday/birthday-3.jpg' },

      // Indoor Maternity
      { id: 'im-1', cat: 'indoor', sub: 'maternity', title: 'A Little Miracle — Ultrasound Sonogram Portrait', url: '/images/indoor-maternity/indoor-maternity-1.jpg' },
      { id: 'im-2', cat: 'indoor', sub: 'maternity', title: 'Royal Nauvari Heritage & Floral Jewelry Grace', url: '/images/indoor-maternity/indoor-maternity-2.jpg' },
      { id: 'im-3', cat: 'indoor', sub: 'maternity', title: 'Sunlit Windowside Parental Warmth & Laughter', url: '/images/indoor-maternity/indoor-maternity-3.jpg' },
      { id: 'im-4', cat: 'indoor', sub: 'maternity', title: 'Traditional Royal Blessing Couple Portrait', url: '/images/indoor-maternity/indoor-maternity-4.jpg' },
      { id: 'im-5', cat: 'indoor', sub: 'maternity', title: 'Couture Chocolate Ruffle Mermaid Studio Gown', url: '/images/indoor-maternity/indoor-maternity-5.jpg' },

      // Indoor Festive
      { id: 'if-1', cat: 'indoor', sub: 'festive', title: 'Mahashivratri Divine Blessings — Little Bholenath', url: '/images/indoor-festive/indoor-festive-1.jpg' },
      { id: 'if-2', cat: 'indoor', sub: 'festive', title: 'Ram Krishna Hari Mauli — Little Warkari Devotee', url: '/images/indoor-festive/indoor-festive-2.jpg' },
      { id: 'if-3', cat: 'indoor', sub: 'festive', title: 'Diwali Festive Joy — Golden Kurta & Dhoti Milestone', url: '/images/indoor-festive/indoor-festive-3.jpg' },
      { id: 'if-4', cat: 'indoor', sub: 'festive', title: 'Navratri Garba Queen — Little Dandiya Celebrations', url: '/images/indoor-festive/indoor-festive-4.jpg' },
      { id: 'if-5', cat: 'indoor', sub: 'festive', title: 'Shubh Deepavali Illumination — Sacred Diya Glow', url: '/images/indoor-festive/indoor-festive-5.jpg' },
      { id: 'if-6', cat: 'indoor', sub: 'festive', title: 'Gokulashtami Bal Gopal — Makhan Matki Play', url: '/images/indoor-festive/indoor-festive-6.jpg' },
      { id: 'if-7', cat: 'indoor', sub: 'festive', title: 'Divine Flute Melody — Royal Little Kanha', url: '/images/indoor-festive/indoor-festive-7.jpg' },

      // Indoor Newborn
      { id: 'in-1', cat: 'indoor', sub: 'newborn', title: 'Newborn Macro Details & Tender Touch', url: '/images/indoor-newborn/newborn-1.jpg' },
      { id: 'in-2', cat: 'indoor', sub: 'newborn', title: 'Serene Sage Green Carriage Nest', url: '/images/indoor-newborn/newborn-2.jpg' },
      { id: 'in-3', cat: 'indoor', sub: 'newborn', title: 'Arched Sunlit Window Slumber', url: '/images/indoor-newborn/newborn-3.jpg' },

      // Outdoor Birthday
      { id: 'ob-1', cat: 'outdoor', sub: 'birthday', title: 'Beachside Teepee & Wooden Milestone Blocks', url: '/images/outdoor-birthday/outdoor-birthday-1.jpg' },
      { id: 'ob-2', cat: 'outdoor', sub: 'birthday', title: 'Sunset Shoreline Family Joy & Laughter', url: '/images/outdoor-birthday/outdoor-birthday-2.jpg' },
      { id: 'ob-3', cat: 'outdoor', sub: 'birthday', title: 'First Birthday Clapping Joy by the Waves', url: '/images/outdoor-birthday/outdoor-birthday-3.jpg' },

      // Outdoor Maternity
      { id: 'om-1', cat: 'outdoor', sub: 'maternity', title: 'Golden Meadow Breeze & Flowing Gown', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80' },
      { id: 'om-2', cat: 'outdoor', sub: 'maternity', title: 'Sunset Stroll Along Scenic Waterway', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80' },
      { id: 'om-3', cat: 'outdoor', sub: 'maternity', title: 'Dusk Silhouette Against Grand Horizons', url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=900&q=80' },
      { id: 'om-4', cat: 'outdoor', sub: 'maternity', title: 'Enchanted Forest Sunray Maternity', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=80' },

      // Outdoor Festive
      { id: 'of-1', cat: 'outdoor', sub: 'festive', title: 'Heritage Archway Royal Festive Portrait', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80' },
      { id: 'of-2', cat: 'outdoor', sub: 'festive', title: 'Vibrant Festive Market Evening Lights', url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=900&q=80' },
      { id: 'of-3', cat: 'outdoor', sub: 'festive', title: 'Grand Courtyard Royal Festive Couple', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80' },
      { id: 'of-4', cat: 'outdoor', sub: 'festive', title: 'Botanical Garden Festive Splendor', url: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?auto=format&fit=crop&w=900&q=80' },

      // Outdoor Newborn
      { id: 'on-1', cat: 'outdoor', sub: 'newborn', title: 'Sweet Baby in Natural Wicker on Green Grass', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80' },
      { id: 'on-2', cat: 'outdoor', sub: 'newborn', title: 'Family Blossom Shaded Portrait with Baby', url: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=900&q=80' },
      { id: 'on-3', cat: 'outdoor', sub: 'newborn', title: 'Gentle Park Breeze Family Bonding', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=900&q=80' },
      { id: 'on-4', cat: 'outdoor', sub: 'newborn', title: 'Warm Golden Sunlight on Mother & Child', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80' },

      // Wedding Category
      { id: 'wed-1', cat: 'wedding', sub: null, title: 'Royal Indian Bride in Intricate Velvet Lehenga', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80' },
      { id: 'wed-2', cat: 'wedding', sub: null, title: 'Sacred Mandap Rituals & Holy Fire Blessings', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80' },
      { id: 'wed-3', cat: 'wedding', sub: null, title: 'Floral Varmala Exchange & Candid Laughter', url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80' },
      { id: 'wed-4', cat: 'wedding', sub: null, title: 'Grand Royal Baraat & Sparkler Procession', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80' },

      // Pre-Wedding Category
      { id: 'pw-1', cat: 'pre-wedding', sub: null, title: 'Regal Black-Tie Couple at Heritage Palace', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80' },
      { id: 'pw-2', cat: 'pre-wedding', sub: null, title: 'Cinematic Sunset Glow by Mountain Lake', url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=80' },
      { id: 'pw-3', cat: 'pre-wedding', sub: null, title: 'Misty Pine Forest Romantic Rendezvous', url: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=900&q=80' },
      { id: 'pw-4', cat: 'pre-wedding', sub: null, title: 'Palace Pillars Silhouette & Golden Flare', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80' }
    ];

    let order = 1;
    for (const g of gallery) {
      db.run(
        "INSERT INTO gallery_items (id, category_id, subcategory_id, image_url, title, display_order) VALUES (?, ?, ?, ?, ?, ?)",
        [g.id, g.cat, g.sub, g.url, g.title, order++]
      );
    }

    // 4. Time slots
    let slotOrder = 1;
    for (const slot of ALL_TIME_SLOTS) {
      db.run(
        "INSERT INTO time_slots (slot_time, display_order) VALUES (?, ?)",
        [slot, slotOrder++]
      );
    }

    console.log("Database initialized and seeded successfully.");
  }

  // Seed default studio payment settings if not present
  const upiCheck = db.exec("SELECT COUNT(*) FROM studio_settings WHERE key = 'upi_id'");
  const upiCount = upiCheck[0]?.values[0][0] || 0;
  if (upiCount === 0) {
    const defaultSvgQr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="100%" height="100%">
      <rect width="320" height="320" fill="#ffffff" rx="16"/>
      <!-- QR Position Markers -->
      <!-- Top Left -->
      <rect x="25" y="25" width="70" height="70" fill="#0D0E15" rx="8"/>
      <rect x="35" y="35" width="50" height="50" fill="#ffffff" rx="4"/>
      <rect x="45" y="45" width="30" height="30" fill="#D4AF37" rx="4"/>
      <!-- Top Right -->
      <rect x="225" y="25" width="70" height="70" fill="#0D0E15" rx="8"/>
      <rect x="235" y="35" width="50" height="50" fill="#ffffff" rx="4"/>
      <rect x="245" y="45" width="30" height="30" fill="#D4AF37" rx="4"/>
      <!-- Bottom Left -->
      <rect x="25" y="225" width="70" height="70" fill="#0D0E15" rx="8"/>
      <rect x="35" y="235" width="50" height="50" fill="#ffffff" rx="4"/>
      <rect x="45" y="245" width="30" height="30" fill="#D4AF37" rx="4"/>
      <!-- Data Blocks Pattern (Simulated Scannable UPI Grid) -->
      <g fill="#0D0E15">
        <rect x="110" y="25" width="14" height="14"/><rect x="140" y="25" width="14" height="14"/><rect x="170" y="25" width="14" height="14"/><rect x="195" y="25" width="14" height="14"/>
        <rect x="110" y="55" width="14" height="14"/><rect x="155" y="55" width="14" height="14"/><rect x="180" y="55" width="14" height="14"/>
        <rect x="125" y="80" width="14" height="14"/><rect x="155" y="80" width="14" height="14"/><rect x="195" y="80" width="14" height="14"/>
        <rect x="25" y="110" width="14" height="14"/><rect x="55" y="110" width="14" height="14"/><rect x="80" y="110" width="14" height="14"/><rect x="110" y="110" width="14" height="14"/>
        <rect x="140" y="110" width="14" height="14"/><rect x="170" y="110" width="14" height="14"/><rect x="225" y="110" width="14" height="14"/><rect x="255" y="110" width="14" height="14"/><rect x="280" y="110" width="14" height="14"/>
        <rect x="25" y="140" width="14" height="14"/><rect x="65" y="140" width="14" height="14"/><rect x="95" y="140" width="14" height="14"/>
        <rect x="225" y="140" width="14" height="14"/><rect x="260" y="140" width="14" height="14"/><rect x="280" y="140" width="14" height="14"/>
        <rect x="40" y="170" width="14" height="14"/><rect x="75" y="170" width="14" height="14"/><rect x="210" y="170" width="14" height="14"/><rect x="240" y="170" width="14" height="14"/><rect x="280" y="170" width="14" height="14"/>
        <rect x="25" y="195" width="14" height="14"/><rect x="55" y="195" width="14" height="14"/><rect x="80" y="195" width="14" height="14"/>
        <rect x="110" y="210" width="14" height="14"/><rect x="140" y="210" width="14" height="14"/><rect x="180" y="210" width="14" height="14"/><rect x="210" y="210" width="14" height="14"/><rect x="240" y="210" width="14" height="14"/><rect x="270" y="210" width="14" height="14"/>
        <rect x="125" y="240" width="14" height="14"/><rect x="160" y="240" width="14" height="14"/><rect x="195" y="240" width="14" height="14"/><rect x="225" y="240" width="14" height="14"/><rect x="255" y="240" width="14" height="14"/><rect x="280" y="240" width="14" height="14"/>
        <rect x="110" y="270" width="14" height="14"/><rect x="145" y="270" width="14" height="14"/><rect x="175" y="270" width="14" height="14"/><rect x="210" y="270" width="14" height="14"/><rect x="245" y="270" width="14" height="14"/><rect x="275" y="270" width="14" height="14"/>
      </g>
      <!-- Center Nilesh Studio Emblem -->
      <circle cx="160" cy="160" r="32" fill="#0D0E15" stroke="#D4AF37" stroke-width="3"/>
      <circle cx="160" cy="160" r="28" fill="#13151F"/>
      <path d="M152 150 L168 150 L172 154 L178 154 L178 170 L142 170 L142 154 L148 154 Z" fill="#D4AF37"/>
      <circle cx="160" cy="162" r="5" fill="#0D0E15" stroke="#F4E6BC" stroke-width="1.5"/>
      <text x="160" y="306" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="bold" fill="#0D0E15" text-anchor="middle" letter-spacing="1">SCAN WITH ANY UPI APP</text>
    </svg>`;
    const defaultDataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(defaultSvgQr);

    db.run("INSERT INTO studio_settings (key, value) VALUES ('upi_id', 'nileshstudio@upi')");
    db.run("INSERT INTO studio_settings (key, value) VALUES ('upi_name', 'Nilesh Studio Fine Art')");
    db.run("INSERT INTO studio_settings (key, value) VALUES ('qr_code_url', ?)", [defaultDataUri]);
  }
}

// Database helper functions

export function registerOrLoginCustomer({ fullName, phoneNumber, email }) {
  if (!fullName || !phoneNumber) {
    throw new Error('Full Name and Phone Number are required.');
  }

  const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
  const cleanName = fullName.trim();
  const cleanEmail = email ? email.trim() : null;

  // Check if customer exists
  const existingStmt = db.prepare("SELECT * FROM customers WHERE phone_number = ?");
  existingStmt.bind([cleanPhone]);
  
  if (existingStmt.step()) {
    const row = existingStmt.getAsObject();
    existingStmt.free();
    // Update name or email if provided
    db.run(
      "UPDATE customers SET full_name = ?, email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [cleanName, cleanEmail, row.id]
    );
    persist();
    return {
      id: row.id,
      fullName: cleanName,
      phoneNumber: cleanPhone,
      email: cleanEmail || row.email,
      createdAt: row.created_at
    };
  }
  existingStmt.free();

  // Create new customer
  const newId = 'cust_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  db.run(
    "INSERT INTO customers (id, full_name, phone_number, email) VALUES (?, ?, ?, ?)",
    [newId, cleanName, cleanPhone, cleanEmail]
  );
  persist();

  return {
    id: newId,
    fullName: cleanName,
    phoneNumber: cleanPhone,
    email: cleanEmail,
    createdAt: new Date().toISOString()
  };
}

export function getCustomerByPhone(phoneNumber) {
  const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
  const stmt = db.prepare("SELECT * FROM customers WHERE phone_number = ?");
  stmt.bind([cleanPhone]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return {
      id: row.id,
      fullName: row.full_name,
      phoneNumber: row.phone_number,
      email: row.email,
      createdAt: row.created_at
    };
  }
  stmt.free();
  return null;
}

export function updateCustomer(id, { fullName, email }) {
  db.run(
    "UPDATE customers SET full_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [fullName.trim(), email ? email.trim() : null, id]
  );
  persist();

  const stmt = db.prepare("SELECT * FROM customers WHERE id = ?");
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return {
      id: row.id,
      fullName: row.full_name,
      phoneNumber: row.phone_number,
      email: row.email,
      createdAt: row.created_at
    };
  }
  stmt.free();
  return null;
}

export function getAllCategories() {
  const catStmt = db.prepare("SELECT * FROM categories ORDER BY display_order ASC");
  const categories = [];
  while (catStmt.step()) {
    categories.push(catStmt.getAsObject());
  }
  catStmt.free();

  const subStmt = db.prepare("SELECT * FROM subcategories ORDER BY display_order ASC");
  const subcategories = [];
  while (subStmt.step()) {
    subcategories.push(subStmt.getAsObject());
  }
  subStmt.free();

  // Attach subcategories to respective categories
  return categories.map(cat => ({
    ...cat,
    subcategories: subcategories.filter(sub => sub.category_id === cat.id)
  }));
}

export function getGalleryItems(categoryId, subcategoryId = null) {
  let query = "SELECT * FROM gallery_items WHERE category_id = ?";
  const params = [categoryId];

  if (subcategoryId) {
    query += " AND subcategory_id = ?";
    params.push(subcategoryId);
  }

  query += " ORDER BY display_order ASC";

  const stmt = db.prepare(query);
  stmt.bind(params);
  const items = [];
  while (stmt.step()) {
    items.push(stmt.getAsObject());
  }
  stmt.free();
  return items;
}

// Real-time slot availability for a specific date
export function getSlotAvailability(dateStr) {
  if (!dateStr) {
    throw new Error('Date is required (YYYY-MM-DD)');
  }

  // Find all active bookings (Pending, Confirmed, Completed) for this date
  const stmt = db.prepare("SELECT time_slot, status FROM bookings WHERE booking_date = ? AND status != 'Cancelled'");
  stmt.bind([dateStr]);
  const bookedSlots = new Set();
  while (stmt.step()) {
    const row = stmt.getAsObject();
    bookedSlots.add(row.time_slot);
  }
  stmt.free();

  // Find all slots blocked out by studio owner
  const blockStmt = db.prepare("SELECT time_slot FROM blocked_slots WHERE block_date = ?");
  blockStmt.bind([dateStr]);
  while (blockStmt.step()) {
    const row = blockStmt.getAsObject();
    bookedSlots.add(row.time_slot);
  }
  blockStmt.free();

  return ALL_TIME_SLOTS.map(slot => ({
    time: slot,
    isBooked: bookedSlots.has(slot),
    date: dateStr
  }));
}

// Standard Studio Pricing for Photography Services
export const SERVICE_PRICING = {
  'indoor_birthday': 4999,
  'indoor_maternity': 5999,
  'indoor_festive': 4999,
  'indoor_newborn': 6999,
  'indoor': 4999,
  'outdoor_birthday': 5999,
  'outdoor_maternity': 6999,
  'outdoor_festive': 5999,
  'outdoor_newborn': 7999,
  'outdoor': 5999,
  'wedding': 29999,
  'pre-wedding': 14999,
};

export function calculatePricing(categoryId, subcategoryId = null, paymentMethod = 'pay_advance') {
  let key = categoryId;
  if (subcategoryId) {
    key = `${categoryId}_${subcategoryId}`;
  }
  const originalAmount = SERVICE_PRICING[key] || SERVICE_PRICING[categoryId] || 4999;

  const isAdvance = (paymentMethod === 'pay_advance' || paymentMethod === 'Pay Before Shoot');
  if (isAdvance) {
    const discountPercentage = 20;
    const discountAmount = Math.round(originalAmount * 0.20);
    const finalPayableAmount = originalAmount - discountAmount;
    return {
      originalAmount,
      discountPercentage,
      discountAmount,
      finalPayableAmount
    };
  } else {
    return {
      originalAmount,
      discountPercentage: 0,
      discountAmount: 0,
      finalPayableAmount: originalAmount
    };
  }
}

// Create Booking with transactional concurrency protection and payment integration
export function createBooking({
  customerId,
  customerName,
  phoneNumber,
  email,
  categoryId,
  categoryName,
  subcategoryId = null,
  subcategoryName = null,
  bookingDate,
  timeSlot,
  specialNotes = '',
  paymentMethod = 'pay_later',
  upiTransactionId = null,
  paymentScreenshotUrl = null
}) {
  if (!customerId || !customerName || !phoneNumber || !categoryId || !bookingDate || !timeSlot) {
    throw new Error('Missing required booking fields');
  }

  // Validate date is not past
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (bookingDate < todayStr) {
    const err = new Error('Cannot book an appointment for a past date.');
    err.status = 400;
    throw err;
  }

  // Validate time slot is in allowed list
  if (!ALL_TIME_SLOTS.includes(timeSlot)) {
    const err = new Error('Invalid time slot selected.');
    err.status = 400;
    throw err;
  }

  // Transactional slot availability check to prevent double booking
  const checkStmt = db.prepare(
    "SELECT id, status FROM bookings WHERE booking_date = ? AND time_slot = ? AND status != 'Cancelled'"
  );
  checkStmt.bind([bookingDate, timeSlot]);
  
  if (checkStmt.step()) {
    checkStmt.free();
    const conflictErr = new Error(`The slot ${timeSlot} on ${bookingDate} has already been booked. Please select another slot.`);
    conflictErr.status = 409;
    throw conflictErr;
  }
  checkStmt.free();

  // Check if slot was blocked by studio owner
  const blockCheck = db.prepare("SELECT reason FROM blocked_slots WHERE block_date = ? AND time_slot = ?");
  blockCheck.bind([bookingDate, timeSlot]);
  if (blockCheck.step()) {
    const row = blockCheck.getAsObject();
    blockCheck.free();
    const conflictErr = new Error(`The slot ${timeSlot} on ${bookingDate} is currently reserved or unavailable (${row.reason || 'Studio Maintenance'}). Please select another slot.`);
    conflictErr.status = 409;
    throw conflictErr;
  }
  blockCheck.free();

  // Calculate pricing and payment details
  const isAdvance = (paymentMethod === 'pay_advance' || paymentMethod === 'Pay Before Shoot');
  const pricing = calculatePricing(categoryId, subcategoryId, isAdvance ? 'pay_advance' : 'pay_later');

  if (isAdvance && !upiTransactionId) {
    const err = new Error('UPI Transaction ID / UTR is required for advance payment.');
    err.status = 400;
    throw err;
  }

  const cleanPaymentMethod = isAdvance ? 'Pay Before Shoot' : 'Pay After Shoot';
  const initialPaymentStatus = isAdvance ? 'Verification Pending' : 'Pay After Shoot';

  // Generate unique booking ID: NS-YYYYMMDD-XXXX
  const dateCompact = bookingDate.replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingId = `NS-${dateCompact}-${randomSuffix}`;

  // Insert booking initially as 'Pending' with payment details
  db.run(
    `INSERT INTO bookings (
      id, customer_id, customer_name, phone_number, email,
      category_id, category_name, subcategory_id, subcategory_name,
      booking_date, time_slot, special_notes, status,
      original_amount, discount_percentage, discount_amount, final_payable_amount,
      payment_method, payment_status, upi_transaction_id, payment_screenshot_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bookingId, customerId, customerName.trim(), phoneNumber.trim(), email ? email.trim() : null,
      categoryId, categoryName, subcategoryId || null, subcategoryName || null,
      bookingDate, timeSlot, specialNotes ? specialNotes.trim() : null,
      pricing.originalAmount, pricing.discountPercentage, pricing.discountAmount, pricing.finalPayableAmount,
      cleanPaymentMethod, initialPaymentStatus, upiTransactionId ? upiTransactionId.trim() : null, paymentScreenshotUrl || null
    ]
  );

  persist();

  const getStmt = db.prepare("SELECT * FROM bookings WHERE id = ?");
  getStmt.bind([bookingId]);
  let newBooking = null;
  if (getStmt.step()) {
    newBooking = getStmt.getAsObject();
  }
  getStmt.free();

  return newBooking;
}

// Get bookings for a specific customer (strictly isolated for customer privacy)
export function getBookingsByCustomer(customerId, phoneNumber = null) {
  let query = "SELECT * FROM bookings WHERE customer_id = ?";
  const params = [customerId];

  if (phoneNumber) {
    query += " OR phone_number = ?";
    params.push(phoneNumber.trim().replace(/\s+/g, ''));
  }

  query += " ORDER BY booking_date DESC, created_at DESC";

  const stmt = db.prepare(query);
  stmt.bind(params);
  const bookings = [];
  while (stmt.step()) {
    bookings.push(stmt.getAsObject());
  }
  stmt.free();
  return bookings;
}

// Customer cancels their own pending booking
export function cancelCustomerBooking(bookingId, customerId) {
  const stmt = db.prepare("SELECT * FROM bookings WHERE id = ? AND customer_id = ?");
  stmt.bind([bookingId, customerId]);
  if (!stmt.step()) {
    stmt.free();
    const err = new Error('Booking not found or not authorized to cancel');
    err.status = 404;
    throw err;
  }
  const booking = stmt.getAsObject();
  stmt.free();

  if (booking.status === 'Cancelled') {
    return booking;
  }

  db.run("UPDATE bookings SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [bookingId]);
  persist();

  return { ...booking, status: 'Cancelled' };
}

// Studio owner backend management functions (for the standalone business portal)
export function getAllBookingsAdmin({ status, date, search }) {
  let query = "SELECT * FROM bookings WHERE 1=1";
  const params = [];

  if (status && status !== 'All') {
    query += " AND status = ?";
    params.push(status);
  }

  if (date) {
    query += " AND booking_date = ?";
    params.push(date);
  }

  if (search) {
    query += " AND (customer_name LIKE ? OR phone_number LIKE ? OR id LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += " ORDER BY booking_date DESC, created_at DESC";

  const stmt = db.prepare(query);
  stmt.bind(params);
  const list = [];
  while (stmt.step()) {
    list.push(stmt.getAsObject());
  }
  stmt.free();
  return list;
}

export function updateBookingStatusAdmin(bookingId, status) {
  const valid = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
  if (!valid.includes(status)) {
    throw new Error('Invalid status. Allowed: ' + valid.join(', '));
  }

  db.run("UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, bookingId]);
  persist();

  const stmt = db.prepare("SELECT * FROM bookings WHERE id = ?");
  stmt.bind([bookingId]);
  let updated = null;
  if (stmt.step()) {
    updated = stmt.getAsObject();
  }
  stmt.free();
  return updated;
}

// Studio Owner Reschedules a Booking to a New Date & Time Slot
export function rescheduleBookingAdmin(bookingId, newDate, newTimeSlot) {
  if (!bookingId || !newDate || !newTimeSlot) {
    throw new Error('Booking ID, new date, and new time slot are required');
  }

  if (!ALL_TIME_SLOTS.includes(newTimeSlot)) {
    throw new Error('Invalid time slot: ' + newTimeSlot);
  }

  // Check if booking exists
  const bStmt = db.prepare("SELECT * FROM bookings WHERE id = ?");
  bStmt.bind([bookingId]);
  if (!bStmt.step()) {
    bStmt.free();
    const err = new Error('Booking not found');
    err.status = 404;
    throw err;
  }
  const existingBooking = bStmt.getAsObject();
  bStmt.free();

  // Check if new slot is already booked by ANOTHER active booking
  const conflictStmt = db.prepare(
    "SELECT id, customer_name FROM bookings WHERE booking_date = ? AND time_slot = ? AND id != ? AND status != 'Cancelled'"
  );
  conflictStmt.bind([newDate, newTimeSlot, bookingId]);
  if (conflictStmt.step()) {
    const conflict = conflictStmt.getAsObject();
    conflictStmt.free();
    const err = new Error(`Cannot reschedule: Slot ${newTimeSlot} on ${newDate} is already booked by ${conflict.customer_name} (${conflict.id})`);
    err.status = 409;
    throw err;
  }
  conflictStmt.free();

  // Check if new slot is blocked
  const blockCheck = db.prepare("SELECT reason FROM blocked_slots WHERE block_date = ? AND time_slot = ?");
  blockCheck.bind([newDate, newTimeSlot]);
  if (blockCheck.step()) {
    const row = blockCheck.getAsObject();
    blockCheck.free();
    const err = new Error(`Cannot reschedule: Slot ${newTimeSlot} on ${newDate} is blocked by studio (${row.reason || 'Blocked'})`);
    err.status = 409;
    throw err;
  }
  blockCheck.free();

  // Perform update
  db.run(
    "UPDATE bookings SET booking_date = ?, time_slot = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [newDate, newTimeSlot, bookingId]
  );
  persist();

  const getUpdated = db.prepare("SELECT * FROM bookings WHERE id = ?");
  getUpdated.bind([bookingId]);
  let updated = null;
  if (getUpdated.step()) {
    updated = getUpdated.getAsObject();
  }
  getUpdated.free();
  return updated;
}

// Studio Owner blocks a time slot (e.g. maintenance, off-day, personal)
export function blockSlotAdmin(date, timeSlot, reason = 'Studio Reserved / Off') {
  if (!date || !timeSlot) {
    throw new Error('Date and time slot are required');
  }

  const blockId = 'block_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  try {
    db.run(
      "INSERT INTO blocked_slots (id, block_date, time_slot, reason) VALUES (?, ?, ?, ?)",
      [blockId, date, timeSlot, reason.trim()]
    );
    persist();
  } catch (e) {
    // If already exists, update reason
    db.run(
      "UPDATE blocked_slots SET reason = ? WHERE block_date = ? AND time_slot = ?",
      [reason.trim(), date, timeSlot]
    );
    persist();
  }

  return { success: true, date, timeSlot, reason };
}

// Studio Owner unblocks a time slot (making it available again)
export function unblockSlotAdmin(date, timeSlot) {
  db.run("DELETE FROM blocked_slots WHERE block_date = ? AND time_slot = ?", [date, timeSlot]);
  persist();
  return { success: true, date, timeSlot };
}

// Studio Owner gets full day schedule with client bookings and blocks
export function getScheduleByDateAdmin(date) {
  if (!date) throw new Error('Date is required');

  // 1. Get client bookings
  const bStmt = db.prepare("SELECT * FROM bookings WHERE booking_date = ? AND status != 'Cancelled'");
  bStmt.bind([date]);
  const bookingsMap = new Map();
  while (bStmt.step()) {
    const row = bStmt.getAsObject();
    bookingsMap.set(row.time_slot, row);
  }
  bStmt.free();

  // 2. Get blocked slots
  const blStmt = db.prepare("SELECT * FROM blocked_slots WHERE block_date = ?");
  blStmt.bind([date]);
  const blockedMap = new Map();
  while (blStmt.step()) {
    const row = blStmt.getAsObject();
    blockedMap.set(row.time_slot, row);
  }
  blStmt.free();

  return ALL_TIME_SLOTS.map(slot => {
    const booking = bookingsMap.get(slot);
    const blocked = blockedMap.get(slot);

    return {
      time: slot,
      date,
      isBooked: !!booking || !!blocked,
      type: booking ? 'client_booking' : blocked ? 'studio_blocked' : 'available',
      booking: booking || null,
      blockedReason: blocked ? blocked.reason : null,
    };
  });
}

// --- STUDIO OWNER PAYMENT MANAGEMENT FUNCTIONS ---

// Verify customer advance payment (mark as 'Paid')
export function verifyPaymentAdmin(bookingId, verifiedBy = 'Studio Owner') {
  db.run(
    `UPDATE bookings SET
      payment_status = 'Paid',
      payment_verification_date = CURRENT_TIMESTAMP,
      payment_verified_by = ?,
      payment_rejection_reason = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [verifiedBy, bookingId]
  );
  persist();

  const stmt = db.prepare("SELECT * FROM bookings WHERE id = ?");
  stmt.bind([bookingId]);
  let updated = null;
  if (stmt.step()) {
    updated = stmt.getAsObject();
  }
  stmt.free();
  return updated;
}

// Reject customer payment (e.g. invalid UTR / fake screenshot)
export function rejectPaymentAdmin(bookingId, reason = 'Payment not received / Invalid UTR', verifiedBy = 'Studio Owner') {
  db.run(
    `UPDATE bookings SET
      payment_status = 'Payment Rejected',
      payment_rejection_reason = ?,
      payment_verification_date = CURRENT_TIMESTAMP,
      payment_verified_by = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [reason.trim(), verifiedBy, bookingId]
  );
  persist();

  const stmt = db.prepare("SELECT * FROM bookings WHERE id = ?");
  stmt.bind([bookingId]);
  let updated = null;
  if (stmt.step()) {
    updated = stmt.getAsObject();
  }
  stmt.free();
  return updated;
}

// Mark 'Pay After Shoot' booking as Paid once customer completes shoot & pays
export function markPaidAfterShootAdmin(bookingId, verifiedBy = 'Studio Owner') {
  db.run(
    `UPDATE bookings SET
      payment_status = 'Paid',
      payment_verification_date = CURRENT_TIMESTAMP,
      payment_verified_by = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [verifiedBy, bookingId]
  );
  persist();

  const stmt = db.prepare("SELECT * FROM bookings WHERE id = ?");
  stmt.bind([bookingId]);
  let updated = null;
  if (stmt.step()) {
    updated = stmt.getAsObject();
  }
  stmt.free();
  return updated;
}

// Get Studio Payment Settings (UPI ID, Payee Name, QR Code Data URL)
export function getStudioPaymentSettings() {
  const stmt = db.prepare("SELECT key, value FROM studio_settings");
  const settings = {
    upiId: 'nileshstudio@upi',
    upiName: 'Nilesh Studio Fine Art',
    qrCodeUrl: ''
  };
  while (stmt.step()) {
    const row = stmt.getAsObject();
    if (row.key === 'upi_id') settings.upiId = row.value;
    if (row.key === 'upi_name') settings.upiName = row.value;
    if (row.key === 'qr_code_url') settings.qrCodeUrl = row.value;
  }
  stmt.free();
  return settings;
}

// Studio owner updates Studio Payment Settings (Uploads custom QR Code or changes UPI ID)
export function updateStudioPaymentSettings({ qrCodeUrl, upiId, upiName }) {
  if (upiId) {
    db.run("INSERT OR REPLACE INTO studio_settings (key, value, updated_at) VALUES ('upi_id', ?, CURRENT_TIMESTAMP)", [upiId.trim()]);
  }
  if (upiName) {
    db.run("INSERT OR REPLACE INTO studio_settings (key, value, updated_at) VALUES ('upi_name', ?, CURRENT_TIMESTAMP)", [upiName.trim()]);
  }
  if (qrCodeUrl) {
    db.run("INSERT OR REPLACE INTO studio_settings (key, value, updated_at) VALUES ('qr_code_url', ?, CURRENT_TIMESTAMP)", [qrCodeUrl.trim()]);
  }
  persist();
  return getStudioPaymentSettings();
}
