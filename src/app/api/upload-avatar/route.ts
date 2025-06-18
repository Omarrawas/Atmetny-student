
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as mime from 'mime';

// Ensure these environment variables are set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase URL or Service Role Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
}

// Initialize Supabase client with service_role key for admin-level access
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
                      ? createClient(supabaseUrl, supabaseServiceRoleKey)
                      : null;

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Supabase client not initialized. Server configuration error.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'لم يتم استقبال أي ملف.' }, { status: 400 });
    }

    // Basic validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json({ message: 'حجم الملف كبير جدًا (الحد الأقصى 5 ميجابايت).' }, { status: 413 });
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ message: 'نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, GIF, WebP.' }, { status: 415 });
    }

    const fileExtension = mime.getExtension(file.type) || 'png';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    // Store avatars in an 'avatars' folder within the 'appfiles' bucket
    const fileNameInBucket = `avatars/${file.name.replace(/\.[^/.]+$/, "")}-${uniqueSuffix}.${fileExtension}`;
    const bucketName = 'appfiles';

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileNameInBucket, buffer, {
        contentType: file.type,
        upsert: true, // Overwrite if file with same name exists (should be rare with uniqueSuffix)
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return NextResponse.json({ message: `فشل رفع الصورة إلى Supabase Storage: ${uploadError.message}` }, { status: 500 });
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileNameInBucket);

    if (!publicUrlData?.publicUrl) {
        console.error('Supabase Storage error: Could not get public URL for uploaded file:', fileNameInBucket);
        // Attempt to delete the orphaned file if URL retrieval fails?
        // await supabaseAdmin.storage.from(bucketName).remove([fileNameInBucket]); // Optional: cleanup
        return NextResponse.json({ message: 'تم رفع الصورة ولكن فشل استرداد الرابط العام.' }, { status: 500 });
    }
    
    const publicPath = publicUrlData.publicUrl;
    console.log(`File uploaded to Supabase Storage: ${bucketName}/${fileNameInBucket}`);
    console.log(`Public URL for DB: ${publicPath}`);

    return NextResponse.json({ success: true, filePath: publicPath, message: 'تم رفع الصورة بنجاح.' });

  } catch (error) {
    console.error('Error in /api/upload-avatar (Supabase Storage):', error);
    let errorMessage = 'فشل رفع الصورة على الخادم.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
    
