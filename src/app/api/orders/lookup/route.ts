import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderNumber, phoneOrEmail } = body;

    if (!orderNumber || !phoneOrEmail) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ mã đơn hàng và số điện thoại hoặc email liên kết.' },
        { status: 400 }
      );
    }

    const trimmedOrderNumber = orderNumber.trim();
    const trimmedPhoneOrEmail = phoneOrEmail.trim().toLowerCase();

    // Query order that matches orderNumber AND has either:
    // 1. phoneNumber matches exactly (ignoring spaces/formatting)
    // 2. user has email matches exactly
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: trimmedOrderNumber,
        OR: [
          { phoneNumber: trimmedPhoneOrEmail },
          { user: { email: trimmedPhoneOrEmail } }
        ]
      },
      include: {
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
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin đơn hàng phù hợp với dữ liệu cung cấp.' },
        { status: 404 }
      );
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
    console.error('Failed to lookup order:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống khi tra cứu đơn hàng.' }, { status: 500 });
  }
}
