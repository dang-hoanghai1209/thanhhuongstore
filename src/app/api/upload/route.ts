import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2000;
const UPLOAD_DIRECTORY = path.join(process.cwd(), 'public', 'uploads', 'products');
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_IMAGE_FORMATS = new Set(['jpeg', 'png', 'webp']);

class UploadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value !== null && typeof value !== 'string';
}

function createSafeFileName() {
  return `product-${Date.now()}-${randomUUID()}.webp`;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const contentType = request.headers.get('content-type') ?? '';

    if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
      throw new UploadError('Content-Type must be multipart/form-data.', 415);
    }

    const formData = await request.formData();
    const uploadedFile = formData.get('file');

    if (!isUploadedFile(uploadedFile)) {
      throw new UploadError('An image file is required in the "file" field.', 400);
    }

    if (!ALLOWED_MIME_TYPES.has(uploadedFile.type.toLowerCase())) {
      throw new UploadError('Only jpg, jpeg, png, and webp images are allowed.', 415);
    }

    if (uploadedFile.size <= 0) {
      throw new UploadError('Uploaded image is empty.', 400);
    }

    if (uploadedFile.size > MAX_FILE_SIZE_BYTES) {
      throw new UploadError('Uploaded image must not exceed 5 MB.', 413);
    }

    const sourceBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    const image = sharp(sourceBuffer, {
      failOn: 'error',
      limitInputPixels: 40_000_000,
    });
    const metadata = await image.metadata();

    if (!metadata.format || !ALLOWED_IMAGE_FORMATS.has(metadata.format)) {
      throw new UploadError('Uploaded file is not a valid supported image.', 415);
    }

    const optimizedImage = await image
      .rotate()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
    const fileName = createSafeFileName();

    await mkdir(UPLOAD_DIRECTORY, { recursive: true });
    await writeFile(path.join(UPLOAD_DIRECTORY, fileName), optimizedImage, {
      flag: 'wx',
    });

    return NextResponse.json(
      {
        url: `/uploads/products/${fileName}`,
        fileName,
        mimeType: 'image/webp',
        size: optimizedImage.length,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to upload product image:', error);

    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: 'Unable to upload product image.' }, { status: 500 });
  }
}
