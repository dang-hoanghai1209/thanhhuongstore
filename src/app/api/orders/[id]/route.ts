import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const order = await prisma.order.findFirst({
      where: {
        id: context.params.id,
        userId: authResult.userId,
      },
      include: {
        savedAddress: true,
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
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    return NextResponse.json({ error: 'Unable to fetch order details.' }, { status: 500 });
  }
}
