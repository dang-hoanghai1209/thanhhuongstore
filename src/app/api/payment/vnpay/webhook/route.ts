import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyVNPayReturn } from '@/lib/vnpay';

export const dynamic = 'force-dynamic';

function callbackResponse({
  rspCode,
  message,
  status = 200,
  details,
}: {
  rspCode: string;
  message: string;
  status?: number;
  details?: object;
}) {
  return NextResponse.json(
    {
      RspCode: rspCode,
      Message: message,
      ...details,
    },
    { status },
  );
}

async function getCallbackParams(request: NextRequest) {
  if (request.method === 'GET') {
    return Object.fromEntries(request.nextUrl.searchParams.entries());
  }

  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = (await request.json()) as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(body).map(([key, value]) => [key, String(value)]),
    );
  }

  return Object.fromEntries(new URLSearchParams(await request.text()).entries());
}

async function handleCallback(request: NextRequest) {
  try {
    const verification = verifyVNPayReturn(await getCallbackParams(request));

    if (!verification.isValid) {
      return callbackResponse({
        rspCode: '97',
        message: 'Invalid secure hash.',
        status: 400,
      });
    }

    if (!verification.orderId || verification.amountMinorUnits <= 0) {
      return callbackResponse({
        rspCode: '01',
        message: 'Invalid callback data.',
        status: 400,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: verification.orderId },
        select: {
          id: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          totalAmount: true,
        },
      });

      if (!order) {
        return { type: 'ORDER_NOT_FOUND' as const };
      }

      if (order.paymentMethod !== 'VNPAY') {
        return { type: 'INVALID_PAYMENT_METHOD' as const };
      }

      const expectedAmountMinorUnits = order.totalAmount
        .mul(100)
        .toDecimalPlaces(0)
        .toNumber();

      if (
        !Number.isSafeInteger(expectedAmountMinorUnits) ||
        expectedAmountMinorUnits !== verification.amountMinorUnits
      ) {
        return { type: 'AMOUNT_MISMATCH' as const };
      }

      const isSuccessfulPayment =
        verification.responseCode === '00' &&
        (!verification.transactionStatus || verification.transactionStatus === '00');

      if (isSuccessfulPayment) {
        const updatedOrder = await tx.order.updateMany({
          where: {
            id: order.id,
            paymentStatus: { not: 'PAID' },
          },
          data: {
            paymentStatus: 'PAID',
            status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
          },
        });

        return updatedOrder.count === 1
          ? { type: 'PAID' as const }
          : { type: 'ALREADY_PROCESSED' as const };
      }

      if (order.paymentStatus === 'PENDING') {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'FAILED' },
        });

        return { type: 'PAYMENT_FAILED' as const };
      }

      return { type: 'ALREADY_PROCESSED' as const };
    });

    switch (result.type) {
      case 'ORDER_NOT_FOUND':
        return callbackResponse({
          rspCode: '01',
          message: 'Order not found.',
          status: 404,
        });
      case 'INVALID_PAYMENT_METHOD':
        return callbackResponse({
          rspCode: '02',
          message: 'Order payment method is not VNPay.',
          status: 409,
        });
      case 'AMOUNT_MISMATCH':
        return callbackResponse({
          rspCode: '04',
          message: 'Payment amount does not match order total.',
          status: 409,
        });
      case 'ALREADY_PROCESSED':
        return callbackResponse({
          rspCode: '02',
          message: 'Order payment was already processed.',
          details: {
            orderId: verification.orderId,
            alreadyProcessed: true,
          },
        });
      case 'PAYMENT_FAILED':
        return callbackResponse({
          rspCode: '00',
          message: 'Payment failure was recorded.',
          details: {
            orderId: verification.orderId,
            paymentStatus: 'FAILED',
          },
        });
      case 'PAID':
        return callbackResponse({
          rspCode: '00',
          message: 'Payment confirmed successfully.',
          details: {
            orderId: verification.orderId,
            paymentStatus: 'PAID',
          },
        });
    }
  } catch (error) {
    console.error('Failed to process VNPay callback:', error);

    return callbackResponse({
      rspCode: '99',
      message: error instanceof Error ? error.message : 'Unable to process VNPay callback.',
      status: 500,
    });
  }
}

export const GET = handleCallback;
export const POST = handleCallback;
