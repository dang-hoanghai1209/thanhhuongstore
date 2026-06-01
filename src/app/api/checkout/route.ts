import { randomUUID } from 'crypto';
import { Prisma } from '../../../../node_modules/.prisma/app-client-v2';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, BANK_CONFIG } from '@/lib/constants';

class CheckoutError extends Error {}

function getBankTransferDetails() {
  return {
    bankId: BANK_CONFIG.bankCode,
    accountNumber: BANK_CONFIG.accountNo,
    accountName: BANK_CONFIG.accountName,
    bankName: BANK_CONFIG.bankName
  };
}

const checkoutSchema = z.object({
  customerName: z.string().trim().optional(),
  fullName: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().min(1, 'Địa chỉ không được để trống'),
  notes: z.string().trim().max(1000, 'Ghi chú không được vượt quá 1000 ký tự').optional(),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER']).default('COD'),
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1, 'Mã biến thể không được để trống'),
        quantity: z.coerce.number().int().positive('Số lượng phải lớn hơn 0'),
      }),
    )
    .min(1, 'Giỏ hàng phải có ít nhất 1 sản phẩm'),
});

export async function POST(request: Request) {
  try {
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
    const { address, notes, paymentMethod, items } = payload.data;
    const bankTransfer = getBankTransferDetails();

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
        },
      });
    });

    return NextResponse.json(
      {
        orderId: order.id,
        status: order.status,
        paymentMethod,
        bankTransfer,
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
