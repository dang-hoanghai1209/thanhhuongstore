import { Prisma, UserRole, WholesaleStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

const querySchema = z.object({
  status: z.nativeEnum(WholesaleStatus).optional(),
});

const patchWholesaleSchema = z.object({
  profileId: z.string().trim().min(1),
  status: z.nativeEnum(WholesaleStatus),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = querySchema.safeParse({
      status: request.nextUrl.searchParams.get('status') ?? undefined,
    });

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid wholesale query.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const profiles = await prisma.wholesaleProfile.findMany({
      where: payload.data.status ? { status: payload.data.status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Failed to fetch wholesale profiles:', error);

    return NextResponse.json({ error: 'Unable to fetch wholesale profiles.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = patchWholesaleSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid wholesale update.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const profile = await prisma.$transaction(async (tx) => {
      const updatedProfile = await tx.wholesaleProfile.update({
        where: { id: payload.data.profileId },
        data: { status: payload.data.status },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (payload.data.status === WholesaleStatus.APPROVED && updatedProfile.user.role !== UserRole.ADMIN) {
        await tx.user.update({
          where: { id: updatedProfile.userId },
          data: { role: UserRole.WHOLESALE },
        });

        return {
          ...updatedProfile,
          user: {
            ...updatedProfile.user,
            role: UserRole.WHOLESALE,
          },
        };
      }

      if (payload.data.status === WholesaleStatus.REJECTED && updatedProfile.user.role === UserRole.WHOLESALE) {
        await tx.user.update({
          where: { id: updatedProfile.userId },
          data: { role: UserRole.CUSTOMER },
        });

        return {
          ...updatedProfile,
          user: {
            ...updatedProfile.user,
            role: UserRole.CUSTOMER,
          },
        };
      }

      return updatedProfile;
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to update wholesale profile:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Wholesale profile not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to update wholesale profile.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
