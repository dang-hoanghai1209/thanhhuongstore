import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    if (!user?.isActive || !user.email) {
      return NextResponse.json({ error: 'Authentication token is invalid or expired.' }, { status: 401 });
    }

    if (user.role !== authResult.role || user.email !== authResult.email) {
      return NextResponse.json({ error: 'Authentication token is stale.' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to fetch authenticated user:', error);

    return NextResponse.json({ error: 'Unable to fetch authenticated user.' }, { status: 500 });
  }
}
