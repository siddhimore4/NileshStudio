import { getDb } from './server/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'nilesh_studio.sqlite');

async function main() {
  const db = await getDb();

  console.log("Updating Outdoor Birthday subcategory cover image...");
  db.run("UPDATE subcategories SET cover_image = ? WHERE id = ? AND category_id = ?", [
    '/images/outdoor-birthday/outdoor-birthday-1.jpg',
    'birthday',
    'outdoor'
  ]);

  console.log("Updating gallery items for Outdoor Birthday...");
  db.run("DELETE FROM gallery_items WHERE category_id = 'outdoor' AND subcategory_id = 'birthday'");

  const items = [
    { id: 'ob-1', cat: 'outdoor', sub: 'birthday', title: 'Beachside Teepee & Wooden Milestone Blocks', url: '/images/outdoor-birthday/outdoor-birthday-1.jpg', order: 1 },
    { id: 'ob-2', cat: 'outdoor', sub: 'birthday', title: 'Sunset Shoreline Family Joy & Laughter', url: '/images/outdoor-birthday/outdoor-birthday-2.jpg', order: 2 },
    { id: 'ob-3', cat: 'outdoor', sub: 'birthday', title: 'First Birthday Clapping Joy by the Waves', url: '/images/outdoor-birthday/outdoor-birthday-3.jpg', order: 3 }
  ];

  for (const item of items) {
    db.run(
      "INSERT INTO gallery_items (id, category_id, subcategory_id, image_url, title, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [item.id, item.cat, item.sub, item.url, item.title, item.order]
    );
  }

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log("Outdoor birthday database records updated successfully!");
}

main().catch(console.error);
