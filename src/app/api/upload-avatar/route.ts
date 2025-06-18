
// IMPORTANT: You need to implement the file saving logic here.
// This is a placeholder API route.
// For local storage, you might use 'fs' and 'path' modules, and a library like 'formidable' or 'multer'.
// Ensure the target directory (e.g., 'public/uploads/avatars') exists and is writable by the server process.

import { NextResponse } from 'next/server';
import { stat, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import mime from 'mime'; // For getting MIME type based on extension

// Helper to ensure directory exists
async function ensureDirExists(dirPath: string) {
  try {
    await stat(dirPath);
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      await mkdir(dirPath, { recursive: true });
    } else {
      throw e;
    }
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'لم يتم استقبال أي ملف.' }, { status: 400 });
    }

    // Basic validation (optional, but recommended)
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json({ message: 'حجم الملف كبير جدًا (الحد الأقصى 5 ميجابايت).' }, { status: 413 });
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ message: 'نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, GIF, WebP.' }, { status: 415 });
    }


    // Create a more unique filename to avoid collisions
    const fileExtension = mime.getExtension(file.type) || 'png'; // Fallback to png
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${file.name.replace(/\.[^/.]+$/, "")}-${uniqueSuffix}.${fileExtension}`;
    
    // Define the path where files will be stored
    // IMPORTANT: This path is relative to the project root when running locally.
    // For Vercel/Netlify, saving to the filesystem like this is generally not persistent.
    // Consider using 'public/uploads/avatars' if you want Next.js to serve them easily as static files.
    // The '/tmp' directory is often writable on serverless platforms for temporary storage.
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    await ensureDirExists(uploadDir);
    
    const filePath = join(uploadDir, filename);
    const publicPath = `/uploads/avatars/${filename}`; // Path to be used in avatar_url

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save the file
    await writeFile(filePath, buffer);

    console.log(`File uploaded successfully: ${filePath}`);
    console.log(`Public path for DB: ${publicPath}`);

    // Return the public path of the saved file
    return NextResponse.json({ success: true, filePath: publicPath, message: 'تم رفع الصورة بنجاح.' });

  } catch (error) {
    console.error('Error in /api/upload-avatar:', error);
    let errorMessage = 'فشل رفع الصورة على الخادم.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

    