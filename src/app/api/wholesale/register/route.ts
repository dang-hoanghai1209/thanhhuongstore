import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const wholesaleSchema = z.object({
  companyName: z.string().trim().min(1).max(255),
  taxCode: z.string().trim().min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = wholesaleSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid wholesale registration.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existingProfile = await prisma.wholesaleProfile.findUnique({
      where: { userId: authResult.userId },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'A wholesale registration already exists.', profile: existingProfile },
        { status: 409 },
      );
    }

    const profile = await prisma.wholesaleProfile.create({
      data: {
        userId: authResult.userId,
        ...payload.data,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Failed to register wholesale profile:', error);
    return NextResponse.json(
      {
        error:
          error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to register wholesale profile.',
      },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
