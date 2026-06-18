import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const orderInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  },
} as const;

function formatOrder<T extends {
  subtotal: unknown;
  discountAmount: unknown;
  shippingFee: unknown;
  totalAmount: unknown;
  items: Array<{
    unitPrice: unknown;
    priceAtPurchase: unknown;
    variant: null | { retailPrice: unknown; wholesalePrice?: unknown };
  }>;
}>(order: T) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    shippingFee: Number(order.shippingFee),
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      priceAtPurchase: Number(item.priceAtPurchase),
      variant: item.variant
        ? (() => {
            const { wholesalePrice: _wholesalePrice, ...variant } = item.variant;
            return {
              ...variant,
              retailPrice: Number(item.variant.retailPrice),
            };
          })()
        : null,
    })),
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const orders = await prisma.order.findMany({
      where: { userId: authResult.userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders.map(formatOrder));
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Unable to fetch orders.' }, { status: 500 });
  }
}
