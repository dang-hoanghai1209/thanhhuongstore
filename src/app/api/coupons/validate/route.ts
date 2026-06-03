import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const cartItemSchema = z.object({
  variantId: z.string().trim().min(1).optional(),
  id: z.string().trim().min(1).optional(),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().finite().nonnegative().optional(),
});

const couponSchema = z.object({
  code: z.string().trim().min(1).max(50).transform((value) => value.toUpperCase()),
  subtotal: z.coerce.number().finite().nonnegative(),
  cartItems: z.array(cartItemSchema).optional(),
  items: z.array(cartItemSchema).optional(),
});

function invalidCoupon(
  message: string,
  finalTotal: number,
  status: number,
  details?: object,
) {
  return NextResponse.json(
    {
      valid: false,
      discountAmount: 0,
      finalTotal,
      message,
      ...details,
    },
    { status },
  );
}

async function validateCoupon(input: unknown) {
  const payload = couponSchema.safeParse(input);

  if (!payload.success) {
    return NextResponse.json(
      {
        valid: false,
        discountAmount: 0,
        finalTotal: 0,
        message: 'Coupon code and a valid subtotal are required.',
        details: payload.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { code, subtotal } = payload.data;
  const coupon = await prisma.coupon.findUnique({
    where: { code },
  });

  if (!coupon) {
    return invalidCoupon('Coupon does not exist.', subtotal, 404, { code });
  }

  if (!coupon.isActive) {
    return invalidCoupon('Coupon is inactive.', subtotal, 409, { code: coupon.code });
  }

  const now = new Date();

  if (coupon.startsAt && coupon.startsAt > now) {
    return invalidCoupon('Coupon is not active yet.', subtotal, 409, {
      code: coupon.code,
      startsAt: coupon.startsAt,
    });
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    return invalidCoupon('Coupon has expired.', subtotal, 410, {
      code: coupon.code,
      endsAt: coupon.endsAt,
    });
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return invalidCoupon('Coupon usage limit has been reached.', subtotal, 409, {
      code: coupon.code,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
    });
  }

  const minOrderValue = Number(coupon.minOrderValue);

  if (subtotal < minOrderValue) {
    return invalidCoupon('Order subtotal does not meet the coupon minimum.', subtotal, 409, {
      code: coupon.code,
      minOrderValue,
      subtotal,
    });
  }

  const discountValue = Number(coupon.discountValue);
  const maxDiscount = coupon.maxDiscount === null ? null : Number(coupon.maxDiscount);

  if (
    !Number.isFinite(discountValue) ||
    discountValue < 0 ||
    (coupon.discountType !== 'percent' && coupon.discountType !== 'fixed') ||
    (coupon.discountType === 'percent' && discountValue > 100)
  ) {
    console.error(`Coupon ${coupon.code} has an invalid discount configuration.`);
    return invalidCoupon('Coupon configuration is invalid.', subtotal, 500, { code: coupon.code });
  }

  const calculatedDiscount =
    coupon.discountType === 'percent' ? (subtotal * discountValue) / 100 : discountValue;
  const cappedDiscount = Math.min(calculatedDiscount, maxDiscount ?? calculatedDiscount);
  const discountAmount = Math.max(0, Math.min(subtotal, cappedDiscount));
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    subtotal,
    discountType: coupon.discountType,
    discountValue,
    discountAmount,
    finalTotal,
    minOrderValue,
    maxDiscount,
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    startsAt: coupon.startsAt,
    endsAt: coupon.endsAt,
    message: 'Coupon is valid.',
  });
}

export async function GET(request: NextRequest) {
  try {
    return await validateCoupon({
      code: request.nextUrl.searchParams.get('code'),
      subtotal: request.nextUrl.searchParams.get('subtotal'),
    });
  } catch (error) {
    console.error('Failed to validate coupon:', error);
    return invalidCoupon('Unable to validate coupon.', 0, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    return await validateCoupon(await request.json());
  } catch (error) {
    console.error('Failed to validate coupon:', error);

    return invalidCoupon(
      error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to validate coupon.',
      0,
      error instanceof SyntaxError ? 400 : 500,
    );
  }
}
