import { getDb } from './server/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'nilesh_studio.sqlite');

async function main() {
  const db = await getDb();

  console.log("Updating subcategory cover images...");
  db.run("UPDATE subcategories SET cover_image = ? WHERE id = ? AND category_id = ?", [
    '/images/indoor-birthday/birthday-1.jpg',
    'birthday',
    'indoor'
  ]);
  db.run("UPDATE subcategories SET cover_image = ? WHERE id = ? AND category_id = ?", [
    '/images/indoor-newborn/newborn-2.jpg',
    'newborn',
    'indoor'
  ]);

  console.log("Updating gallery items for Indoor Birthday...");
  // Delete existing indoor birthday items
  db.run("DELETE FROM gallery_items WHERE category_id = 'indoor' AND subcategory_id = 'birthday'");
  const birthdayItems = [
    { id: 'ib-1', cat: 'indoor', sub: 'birthday', title: 'Happy Birthday Little Explorer', url: '/images/indoor-birthday/birthday-1.jpg', order: 1 },
    { id: 'ib-2', cat: 'indoor', sub: 'birthday', title: 'Birthday Joy & Teddy Bear Picnic', url: '/images/indoor-birthday/birthday-2.jpg', order: 2 },
    { id: 'ib-3', cat: 'indoor', sub: 'birthday', title: 'Vintage Scooter Milestone Ride', url: '/images/indoor-birthday/birthday-3.jpg', order: 3 }
  ];
  for (const b of birthdayItems) {
    db.run(
      "INSERT INTO gallery_items (id, category_id, subcategory_id, image_url, title, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [b.id, b.cat, b.sub, b.url, b.title, b.order]
    );
  }

  console.log("Updating gallery items for Indoor Newborn...");
  // Delete existing indoor newborn items
  db.run("DELETE FROM gallery_items WHERE category_id = 'indoor' AND subcategory_id = 'newborn'");
  const newbornItems = [
    { id: 'in-1', cat: 'indoor', sub: 'newborn', title: 'Newborn Macro Details & Tender Touch', url: '/images/indoor-newborn/newborn-1.jpg', order: 1 },
    { id: 'in-2', cat: 'indoor', sub: 'newborn', title: 'Serene Sage Green Carriage Nest', url: '/images/indoor-newborn/newborn-2.jpg', order: 2 },
    { id: 'in-3', cat: 'indoor', sub: 'newborn', title: 'Arched Sunlit Window Slumber', url: '/images/indoor-newborn/newborn-3.jpg', order: 3 }
  ];
  for (const n of newbornItems) {
    db.run(
      "INSERT INTO gallery_items (id, category_id, subcategory_id, image_url, title, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [n.id, n.cat, n.sub, n.url, n.title, n.order]
    );
  }

  // Persist to disk
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log("SQLite database successfully updated and saved to data/nilesh_studio.sqlite!");
}

main().catch(console.error);
