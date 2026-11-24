import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// The 8 dedicated categories/buckets specified by Nilesh Studio
export const VALID_FOLDERS = [
  'indoor',
  'outdoor',
  'wedding',
  'pre-wedding',
  'birthday',
  'maternity',
  'festive',
  'newborn'
];

const LOCAL_UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}

/**
 * Uploads a photo buffer or base64 to Supabase Storage (or local storage fallback)
 */
export async function uploadPhoto({ fileBuffer, fileName, mimeType, folder = 'indoor' }) {
  const sanitizedFolder = VALID_FOLDERS.includes(folder) ? folder : 'indoor';
  const cleanExt = path.extname(fileName) || '.jpg';
  const uniqueName = `${sanitizedFolder}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${cleanExt}`;

  // 1. If Supabase is configured, upload to Supabase Storage
  if (supabase) {
    try {
      const bucketName = 'nilesh-studio-photos';
      // Attempt upload to Supabase bucket
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(`${sanitizedFolder}/${uniqueName}`, fileBuffer, {
          contentType: mimeType || 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error('Supabase storage upload error:', error.message);
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Supabase Storage upload failed: ${error.message}. Local disk storage is disabled in production.`);
        }
      } else {
        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(`${sanitizedFolder}/${uniqueName}`);
        
        return {
          success: true,
          url: publicData.publicUrl,
          fileName: uniqueName,
          provider: 'supabase',
          folder: sanitizedFolder
        };
      }
    } catch (err) {
      console.error('Supabase upload exception:', err);
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
    }
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('Supabase Storage is not configured. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production for permanent image storage.');
  }

  // 2. Local fallback storage
  const targetFolder = path.join(LOCAL_UPLOADS_DIR, sanitizedFolder);
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  const filePath = path.join(targetFolder, uniqueName);
  fs.writeFileSync(filePath, fileBuffer);

  return {
    success: true,
    url: `/uploads/${sanitizedFolder}/${uniqueName}`,
    fileName: uniqueName,
    provider: 'local',
    folder: sanitizedFolder
  };
}

/**
 * Deletes a photo from Supabase Storage (or local storage)
 */
export async function deletePhoto(imageUrl) {
  if (!imageUrl) return { success: false, error: 'No image URL provided' };

  if (supabase && imageUrl.includes('supabase.co')) {
    try {
      const bucketName = 'nilesh-studio-photos';
      // Extract path after /object/public/nilesh-studio-photos/
      const match = imageUrl.match(/nilesh-studio-photos\/(.+)$/);
      if (match && match[1]) {
        const { error } = await supabase.storage.from(bucketName).remove([match[1]]);
        if (error) console.warn('Supabase delete warning:', error.message);
      }
      return { success: true, provider: 'supabase' };
    } catch (err) {
      console.error('Supabase delete error:', err);
    }
  }

  if (imageUrl.startsWith('/uploads/')) {
    try {
      const relPath = imageUrl.replace(/^\/uploads\//, '');
      const fullPath = path.join(LOCAL_UPLOADS_DIR, relPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return { success: true, provider: 'local' };
    } catch (err) {
      console.warn('Local file unlink warning:', err);
    }
  }

  return { success: true };
}
