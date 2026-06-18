import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  phone: z.string().trim().min(1, 'Phone is required.').max(30),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((value) => value || undefined)
    .pipe(z.string().email().optional()),
  subject: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => value || undefined),
  message: z.string().trim().min(1, 'Message is required.').max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const payload = contactSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid contact inquiry payload.',
          details: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const inquiry = await prisma.contactInquiry.create({
      data: payload.data,
      select: {
        id: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        inquiryId: inquiry.id,
        message: 'Contact inquiry received.',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create contact inquiry:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof SyntaxError
            ? 'Invalid JSON payload.'
            : 'Unable to submit contact inquiry.',
      },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
