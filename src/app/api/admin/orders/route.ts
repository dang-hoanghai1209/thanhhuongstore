import { OrderStatus } from '../../../../../node_modules/.prisma/app-client-v2';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

const updateOrderSchema = z.object({
  orderId: z.string().trim().min(1, 'orderId không được để trống'),
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED']),
});

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
            },
          },
        },
      },
    },
  },
} as const;

function toDatabaseStatus(status: z.infer<typeof updateOrderSchema>['status']) {
  return status === 'COMPLETED' ? OrderStatus.DELIVERED : status;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const orders = await prisma.order.findMany({
      include: orderInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedOrders = orders.map((order) => {
      const formattedItems = order.items.map((item) => {
        const formattedVariant = item.variant
          ? {
              ...item.variant,
              retailPrice: Number(item.variant.retailPrice),
              wholesalePrice: Number(item.variant.wholesalePrice),
            }
          : null;

        return {
          ...item,
          unitPrice: Number(item.unitPrice),
          priceAtPurchase: Number(item.priceAtPurchase),
          variant: formattedVariant,
        };
      });

      return {
        ...order,
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        shippingFee: Number(order.shippingFee),
        totalAmount: Number(order.totalAmount),
        items: formattedItems,
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Failed to fetch admin orders:', error);

    return NextResponse.json(
      { message: 'Không thể lấy danh sách đơn hàng' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = updateOrderSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        {
          message: 'Dữ liệu cập nhật không hợp lệ',
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const targetStatus = toDatabaseStatus(payload.data.status);

    await prisma.$transaction(async (tx) => {
      // 1. Find the order first
      const order = await tx.order.findUnique({
        where: { id: payload.data.orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      const originalStatus = order.status;

      // 2. If transitioning to CANCELLED from a non-cancelled state, restore stock
      if (targetStatus === OrderStatus.CANCELLED && originalStatus !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
      }
      // If transitioning FROM CANCELLED to a non-cancelled state, check and decrement stock
      else if (originalStatus === OrderStatus.CANCELLED && targetStatus !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          if (item.variantId) {
            const variant = await tx.productVariant.findUnique({
              where: { id: item.variantId },
            });
            if (!variant || variant.stock < item.quantity) {
              throw new Error(`INSUFFICIENT_STOCK:${item.productName}`);
            }
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }
      }

      // 3. Update the order status
      await tx.order.update({
        where: { id: payload.data.orderId },
        data: {
          status: targetStatus,
        },
      });
    });

    return NextResponse.json({
      orderId: payload.data.orderId,
      status: payload.data.status,
    });
  } catch (error) {
    console.error('Failed to update admin order:', error);

    if (error instanceof Error) {
      if (error.message === 'ORDER_NOT_FOUND') {
        return NextResponse.json(
          { message: 'Không tìm thấy đơn hàng' },
          { status: 404 },
        );
      }
      if (error.message.startsWith('INSUFFICIENT_STOCK:')) {
        const productName = error.message.replace('INSUFFICIENT_STOCK:', '');
        return NextResponse.json(
          { message: `Sản phẩm "${productName}" không đủ tồn kho để phục hồi đơn hàng` },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        message:
          error instanceof SyntaxError ? 'JSON payload không hợp lệ' : 'Không thể cập nhật đơn hàng',
      },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
