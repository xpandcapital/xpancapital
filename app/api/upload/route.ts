import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'cms'
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' 
      }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop() || 'png'
    const fileName = `${timestamp}-${randomStr}.${extension}`
    const filePath = `${folder}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cms-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      
      const { error: bucketError } = await supabase.storage.createBucket('cms-images', {
        public: true,
        fileSizeLimit: 5242880
      })
      
      if (bucketError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create storage bucket: ' + bucketError.message 
        }, { status: 500 })
      }

      const { data: retryData, error: retryError } = await supabase.storage
        .from('cms-images')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (retryError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Upload failed: ' + retryError.message 
        }, { status: 500 })
      }

      const { data: urlData } = supabase.storage
        .from('cms-images')
        .getPublicUrl(retryData.path)

      return NextResponse.json({ 
        success: true, 
        url: urlData.publicUrl 
      })
    }

    const { data: urlData } = supabase.storage
      .from('cms-images')
      .getPublicUrl(uploadData.path)

    return NextResponse.json({ 
      success: true, 
      url: urlData.publicUrl 
    })
  } catch {
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 })
  }
}