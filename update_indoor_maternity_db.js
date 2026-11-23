import { getDb } from './server/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'nilesh_studio.sqlite');

async function main() {
  const db = await getDb();

  console.log("Updating Indoor Maternity subcategory cover image...");
  db.run("UPDATE subcategories SET cover_image = ? WHERE id = ? AND category_id = ?", [
    '/images/indoor-maternity/indoor-maternity-2.jpg',
    'maternity',
    'indoor'
  ]);

  console.log("Updating gallery items for Indoor Maternity...");
  db.run("DELETE FROM gallery_items WHERE category_id = 'indoor' AND subcategory_id = 'maternity'");

  const items = [
    { id: 'im-1', cat: 'indoor', sub: 'maternity', title: 'A Little Miracle — Ultrasound Sonogram Portrait', url: '/images/indoor-maternity/indoor-maternity-1.jpg', order: 1 },
    { id: 'im-2', cat: 'indoor', sub: 'maternity', title: 'Royal Nauvari Heritage & Floral Jewelry Grace', url: '/images/indoor-maternity/indoor-maternity-2.jpg', order: 2 },
    { id: 'im-3', cat: 'indoor', sub: 'maternity', title: 'Sunlit Windowside Parental Warmth & Laughter', url: '/images/indoor-maternity/indoor-maternity-3.jpg', order: 3 },
    { id: 'im-4', cat: 'indoor', sub: 'maternity', title: 'Traditional Royal Blessing Couple Portrait', url: '/images/indoor-maternity/indoor-maternity-4.jpg', order: 4 },
    { id: 'im-5', cat: 'indoor', sub: 'maternity', title: 'Couture Chocolate Ruffle Mermaid Studio Gown', url: '/images/indoor-maternity/indoor-maternity-5.jpg', order: 5 }
  ];

  for (const item of items) {
    db.run(
      "INSERT INTO gallery_items (id, category_id, subcategory_id, image_url, title, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [item.id, item.cat, item.sub, item.url, item.title, item.order]
    );
  }

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log("Indoor maternity database records updated successfully!");
}

main().catch(console.error);
