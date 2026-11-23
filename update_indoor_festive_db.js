import { getDb } from './server/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'nilesh_studio.sqlite');

async function main() {
  const db = await getDb();

  console.log("Updating Indoor Festive subcategory cover image...");
  db.run("UPDATE subcategories SET cover_image = ? WHERE id = ? AND category_id = ?", [
    '/images/indoor-festive/indoor-festive-6.jpg',
    'festive',
    'indoor'
  ]);

  console.log("Updating gallery items for Indoor Festive...");
  db.run("DELETE FROM gallery_items WHERE category_id = 'indoor' AND subcategory_id = 'festive'");

  const items = [
    { id: 'if-1', cat: 'indoor', sub: 'festive', title: 'Mahashivratri Divine Blessings — Little Bholenath', url: '/images/indoor-festive/indoor-festive-1.jpg', order: 1 },
    { id: 'if-2', cat: 'indoor', sub: 'festive', title: 'Ram Krishna Hari Mauli — Little Warkari Devotee', url: '/images/indoor-festive/indoor-festive-2.jpg', order: 2 },
    { id: 'if-3', cat: 'indoor', sub: 'festive', title: 'Diwali Festive Joy — Golden Kurta & Dhoti Milestone', url: '/images/indoor-festive/indoor-festive-3.jpg', order: 3 },
    { id: 'if-4', cat: 'indoor', sub: 'festive', title: 'Navratri Garba Queen — Little Dandiya Celebrations', url: '/images/indoor-festive/indoor-festive-4.jpg', order: 4 },
    { id: 'if-5', cat: 'indoor', sub: 'festive', title: 'Shubh Deepavali Illumination — Sacred Diya Glow', url: '/images/indoor-festive/indoor-festive-5.jpg', order: 5 },
    { id: 'if-6', cat: 'indoor', sub: 'festive', title: 'Gokulashtami Bal Gopal — Makhan Matki Play', url: '/images/indoor-festive/indoor-festive-6.jpg', order: 6 },
    { id: 'if-7', cat: 'indoor', sub: 'festive', title: 'Divine Flute Melody — Royal Little Kanha', url: '/images/indoor-festive/indoor-festive-7.jpg', order: 7 }
  ];

  for (const item of items) {
    db.run(
      "INSERT INTO gallery_items (id, category_id, subcategory_id, image_url, title, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [item.id, item.cat, item.sub, item.url, item.title, item.order]
    );
  }

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log("Indoor festive database records updated successfully!");
}

main().catch(console.error);
