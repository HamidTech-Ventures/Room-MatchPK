import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePath = resolvedParams.path.join('/');
    const fullPath = path.join(process.cwd(), 'uploads', filePath);
    
    // Security check: ensure the path is within uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Check if it's a file (not a directory)
    const stats = fs.statSync(resolvedPath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: 'Not a file' }, { status: 400 });
    }
    
    // Read and serve the file
    const fileBuffer = fs.readFileSync(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();
    
    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
