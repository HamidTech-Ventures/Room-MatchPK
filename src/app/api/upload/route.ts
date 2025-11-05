import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const propertyId = formData.get('propertyId') as string || 'temp'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', propertyId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uploadedFiles: string[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue // Skip non-image files
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = path.extname(file.name)
      const filename = `${timestamp}_${randomString}${extension}`
      
      const filepath = path.join(uploadDir, filename)
      
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      await writeFile(filepath, buffer)
      
      // Store relative path for database
      const relativePath = `/uploads/${propertyId}/${filename}`
      uploadedFiles.push(relativePath)
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} files uploaded successfully`
    })

  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}

// GET - Get uploaded files for a property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', propertyId)
    
    if (!existsSync(uploadDir)) {
      return NextResponse.json({
        success: true,
        files: []
      })
    }

    const fs = require('fs')
    const files = fs.readdirSync(uploadDir)
    const imageFiles = files
      .filter((file: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file: string) => `/uploads/${propertyId}/${file}`)

    return NextResponse.json({
      success: true,
      files: imageFiles
    })

  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}