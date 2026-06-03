import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const addressFieldsSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(8).max(20),
  province: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  ward: z.string().trim().min(1).max(100),
  street: z.string().trim().min(1).max(255),
  isDefault: z.boolean().default(false),
});

const updateAddressSchema = addressFieldsSchema.partial().extend({
  id: z.string().trim().min(1),
});

const deleteAddressSchema = z.object({
  id: z.string().trim().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const addresses = await prisma.address.findMany({
      where: { userId: authResult.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
    return NextResponse.json({ error: 'Unable to fetch addresses.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = addressFieldsSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid address data.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const address = await prisma.$transaction(async (tx) => {
      if (payload.data.isDefault) {
        await tx.address.updateMany({
          where: { userId: authResult.userId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          ...payload.data,
          userId: authResult.userId,
        },
      });
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Failed to create address:', error);
    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to create address.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = updateAddressSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid address data.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { id, ...data } = payload.data;
    const address = await prisma.$transaction(async (tx) => {
      const existingAddress = await tx.address.findFirst({
        where: { id, userId: authResult.userId },
      });

      if (!existingAddress) {
        return null;
      }

      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: authResult.userId, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data,
      });
    });

    if (!address) {
      return NextResponse.json({ error: 'Address not found.' }, { status: 404 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error('Failed to update address:', error);
    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to update address.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json().catch(() => ({}));
    const payload = deleteAddressSchema.safeParse({
      id: body.id ?? request.nextUrl.searchParams.get('id'),
    });

    if (!payload.success) {
      return NextResponse.json({ error: 'Address id is required.' }, { status: 400 });
    }

    const deletedAddress = await prisma.address.deleteMany({
      where: {
        id: payload.data.id,
        userId: authResult.userId,
      },
    });

    if (deletedAddress.count !== 1) {
      return NextResponse.json({ error: 'Address not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete address:', error);
    return NextResponse.json({ error: 'Unable to delete address.' }, { status: 500 });
  }
}
