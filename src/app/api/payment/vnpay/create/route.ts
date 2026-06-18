import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { optionalAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createVNPayUrl, isVNPayConfigured } from '@/lib/vnpay';

export const dynamic = 'force-dynamic';

const createPaymentSchema = z.object({
  orderId: z.string().uuid(),
});

function getClientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    if (!isVNPayConfigured()) {
      return NextResponse.json({ error: 'VNPay is temporarily unavailable.' }, { status: 503 });
    }

    const authResult = await optionalAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = createPaymentSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'A valid orderId is required.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: payload.data.orderId },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        totalAmount: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.userId && !authResult) {
      return NextResponse.json({ error: 'Authentication is required for this order.' }, { status: 401 });
    }

    if (order.userId && order.userId !== authResult?.userId) {
      return NextResponse.json({ error: 'You cannot pay for this order.' }, { status: 403 });
    }

    if (order.paymentMethod !== 'VNPAY') {
      return NextResponse.json({ error: 'Order payment method is not VNPay.' }, { status: 409 });
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Order is already paid.' }, { status: 409 });
    }

    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
      return NextResponse.json({ error: 'Order cannot be paid in its current status.' }, { status: 409 });
    }

    const paymentUrl = createVNPayUrl({
      ipAddr: getClientIp(request),
      orderId: order.id,
      amount: Number(order.totalAmount),
      orderInfo: `Thanh toan don hang ${order.orderNumber}`,
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl,
    });
  } catch (error) {
    console.error('Failed to create VNPay payment URL:', error);

    return NextResponse.json(
      {
        error:
          error instanceof SyntaxError
            ? 'Invalid JSON payload.'
            : error instanceof Error
              ? error.message
              : 'Unable to create VNPay payment URL.',
      },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
