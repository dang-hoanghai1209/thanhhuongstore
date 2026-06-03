import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

const couponSchema = z.object({
  code: z.string().trim().min(1).max(50).transform((value) => value.toUpperCase()),
  isActive: z.boolean().optional(),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().nonnegative().optional(),
  maxDiscount: z.coerce.number().positive().nullable().optional(),
  usageLimit: z.coerce.number().int().nonnegative().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
});

const patchCouponSchema = couponSchema.partial().extend({
  id: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).max(50).transform((value) => value.toUpperCase()).optional(),
});

const deleteCouponSchema = z.object({
  id: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).max(50).transform((value) => value.toUpperCase()).optional(),
}).refine((value) => value.id || value.code, {
  message: 'id or code is required.',
});

function formatCoupon(coupon: {
  discountValue: Prisma.Decimal;
  minOrderValue: Prisma.Decimal;
  maxDiscount: Prisma.Decimal | null;
  [key: string]: unknown;
}) {
  return {
    ...coupon,
    discountValue: Number(coupon.discountValue),
    minOrderValue: Number(coupon.minOrderValue),
    maxDiscount: coupon.maxDiscount === null ? null : Number(coupon.maxDiscount),
  };
}

async function assertAdmin(request: NextRequest) {
  const authResult = await requireAdmin(request);

  return authResult instanceof NextResponse ? authResult : null;
}

export async function GET(request: NextRequest) {
  try {
    const authError = await assertAdmin(request);

    if (authError) {
      return authError;
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });

    return NextResponse.json({ coupons: coupons.map(formatCoupon) });
  } catch (error) {
    console.error('Failed to fetch coupons:', error);

    return NextResponse.json({ error: 'Unable to fetch coupons.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await assertAdmin(request);

    if (authError) {
      return authError;
    }

    const payload = couponSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid coupon data.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        ...payload.data,
        minOrderValue: payload.data.minOrderValue ?? 0,
        usageLimit: payload.data.usageLimit ?? 0,
        isActive: payload.data.isActive ?? true,
      },
    });

    return NextResponse.json({ coupon: formatCoupon(coupon) }, { status: 201 });
  } catch (error) {
    console.error('Failed to create coupon:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Coupon code already exists.' }, { status: 409 });
    }

    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to create coupon.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authError = await assertAdmin(request);

    if (authError) {
      return authError;
    }

    const payload = patchCouponSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid coupon update.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { id, ...data } = payload.data;
    const targetCode = data.code;

    if (!id && !targetCode) {
      return NextResponse.json({ error: 'id or code is required.' }, { status: 400 });
    }

    const coupon = await prisma.coupon.update({
      where: id ? { id } : { code: targetCode },
      data,
    });

    return NextResponse.json({ coupon: formatCoupon(coupon) });
  } catch (error) {
    console.error('Failed to update coupon:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to update coupon.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = await assertAdmin(request);

    if (authError) {
      return authError;
    }

    const body = await request.json().catch(() => ({}));
    const payload = deleteCouponSchema.safeParse({
      ...body,
      id: body.id ?? request.nextUrl.searchParams.get('id') ?? undefined,
      code: body.code ?? request.nextUrl.searchParams.get('code') ?? undefined,
    });

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid coupon delete request.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await prisma.coupon.delete({
      where: payload.data.id ? { id: payload.data.id } : { code: payload.data.code },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete coupon:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Unable to delete coupon.' }, { status: 500 });
  }
}
