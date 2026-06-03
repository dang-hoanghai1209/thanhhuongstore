import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).nullable().optional(),
  firstName: z.string().trim().min(1).max(50).nullable().optional(),
  lastName: z.string().trim().min(1).max(50).nullable().optional(),
  phone: z.string().trim().min(8).max(20).nullable().optional(),
});

const profileSelect = {
  id: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  phone: true,
  image: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: profileSelect,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Unable to fetch profile.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = updateProfileSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid profile data.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: authResult.userId },
      data: payload.data,
      select: profileSelect,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to update profile.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
