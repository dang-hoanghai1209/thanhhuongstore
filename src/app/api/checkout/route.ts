import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { optionalAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, BANK_CONFIG } from '@/lib/constants';
import { isVNPayConfigured } from '@/lib/vnpay';

class CheckoutError extends Error {}

function getBankTransferDetails() {
  return {
    bankId: BANK_CONFIG.bankCode,
    accountNumber: BANK_CONFIG.accountNo,
    accountName: BANK_CONFIG.accountName,
    bankName: BANK_CONFIG.bankName,
  };
}

function getBankTransferPayload({
  amount,
  orderNumber,
}: {
  amount: number;
  orderNumber: string;
}) {
  const bankTransfer = getBankTransferDetails();
  const transferContent = `HHSNEAKER ${orderNumber}`;
  const qrParams = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo: transferContent,
    accountName: bankTransfer.accountName,
  });

  return {
    ...bankTransfer,
    amount,
    transferContent,
    qrImageUrl: `https://img.vietqr.io/image/${bankTransfer.bankId}-${bankTransfer.accountNumber}-compact2.png?${qrParams.toString()}`,
  };
}

const checkoutSchema = z.object({
  customerName: z.string().trim().optional(),
  fullName: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  phoneNumber: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().min(1, 'Địa chỉ không được để trống'),
  notes: z.string().trim().max(1000, 'Ghi chú không được vượt quá 1000 ký tự').optional(),
  note: z.string().trim().max(1000).optional(),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER', 'VNPAY']).default('COD'),
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1, 'Mã biến thể không được để trống'),
        quantity: z.coerce.number().int().positive('Số lượng phải lớn hơn 0'),
      }),
    )
    .min(1, 'Giỏ hàng phải có ít nhất 1 sản phẩm'),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await optionalAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const payload = checkoutSchema.safeParse(body);

    if (!payload.success) {
      return NextResponse.json(
        {
          message: 'Dữ liệu đặt hàng không hợp lệ',
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const customerName = payload.data.customerName ?? payload.data.fullName;
    const phoneNumber = payload.data.phoneNumber ?? payload.data.phone;
    const { address, paymentMethod, items } = payload.data;
    const notes = payload.data.notes ?? payload.data.note;

    if (paymentMethod === 'VNPAY' && !isVNPayConfigured()) {
      return NextResponse.json(
        {
          message: 'VNPay is temporarily unavailable.',
        },
        { status: 503 },
      );
    }

    if (!customerName || !phoneNumber) {
      return NextResponse.json(
        {
          message: 'Vui lòng nhập tên khách hàng và số điện thoại',
        },
        { status: 400 },
      );
    }

    const quantitiesByVariantId = new Map<string, number>();

    for (const item of items) {
      quantitiesByVariantId.set(
        item.id,
        (quantitiesByVariantId.get(item.id) ?? 0) + item.quantity,
      );
    }

    const normalizedItems = Array.from(quantitiesByVariantId, ([variantId, quantity]) => ({
      variantId,
      quantity,
    }));
    const itemIds = normalizedItems.map((item) => item.variantId);

    const order = await prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: {
          id: {
            in: itemIds,
          },
          product: {
            isActive: true,
          },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (variants.length !== normalizedItems.length) {
        throw new CheckoutError('Một hoặc nhiều ID không tồn tại trong bảng ProductVariant');
      }

      const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
      let totalAmount = new Prisma.Decimal(0);

      const orderItems = normalizedItems.map((item) => {
        const variant = variantsById.get(item.variantId);

        if (!variant) {
          throw new CheckoutError('Không tìm thấy biến thể sản phẩm');
        }

        if (variant.stock < item.quantity) {
          throw new CheckoutError(`Sản phẩm "${variant.product.name}" không đủ tồn kho`);
        }

        totalAmount = totalAmount.add(variant.retailPrice.mul(item.quantity));

        return {
          productId: variant.product.id,
          variantId: variant.id,
          quantity: item.quantity,
          unitPrice: variant.retailPrice,
          priceAtPurchase: variant.retailPrice,
          productName: variant.product.name,
        };
      });

      for (const item of normalizedItems) {
        const updatedVariant = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedVariant.count !== 1) {
          throw new CheckoutError('Một hoặc nhiều sản phẩm không đủ tồn kho');
        }
      }

      const shippingFee = totalAmount.greaterThanOrEqualTo(FREE_SHIPPING_THRESHOLD)
        ? new Prisma.Decimal(0)
        : new Prisma.Decimal(SHIPPING_FEE);
      const payableAmount = totalAmount.add(shippingFee);

      return tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`,
          userId: authResult?.userId,
          customerName,
          phoneNumber,
          address,
          notes,
          shippingAddress: {
            customerName,
            phoneNumber,
            address,
          },
          subtotal: totalAmount,
          shippingFee,
          totalAmount: payableAmount,
          paymentMethod,
          items: {
            create: orderItems,
          },
        },
        select: {
          id: true,
          status: true,
          orderNumber: true,
          totalAmount: true,
          paymentStatus: true,
        },
      });
    });

    const totalAmount = Number(order.totalAmount);
    const bankTransfer =
      paymentMethod === 'BANK_TRANSFER'
        ? getBankTransferPayload({
            amount: totalAmount,
            orderNumber: order.orderNumber,
          })
        : undefined;

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully.',
        order: {
          id: order.id,
          code: order.orderNumber,
          orderNumber: order.orderNumber,
          total: totalAmount,
          totalAmount,
          status: order.status,
          paymentMethod,
          paymentStatus: order.paymentStatus,
        },
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderCode: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod,
        total: totalAmount,
        totalAmount,
        ...(bankTransfer ? { bankTransfer } : {}),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Failed to create checkout order:', error);

    return NextResponse.json(
      {
        message:
          error instanceof SyntaxError
            ? 'JSON payload không hợp lệ'
            : error instanceof Error
              ? error.message
              : 'Không thể tạo đơn hàng',
      },
      { status: error instanceof CheckoutError || error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
