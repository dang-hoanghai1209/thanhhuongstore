'use server';

import { OrderStatus } from '../../../node_modules/.prisma/app-client-v2';

import prisma from '@/lib/prisma';

export interface AdminDashboardTopVariant {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  size: string;
  color: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  soldQuantity: number;
  revenue: number;
}

export interface AdminDashboardData {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  topVariants: AdminDashboardTopVariant[];
}

function toSafeNumber(value: unknown) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export async function getAdminDashboardAction(): Promise<
  { success: true; data: AdminDashboardData } | { success: false; message: string }
> {
  try {
    const [revenueAggregate, totalOrders, pendingOrders, completedOrders, groupedVariants] =
      await prisma.$transaction([
        prisma.order.aggregate({
          where: {
            status: OrderStatus.DELIVERED,
          },
          _sum: {
            totalAmount: true,
          },
        }),
        prisma.order.count(),
        prisma.order.count({
          where: {
            status: OrderStatus.PENDING,
          },
        }),
        prisma.order.count({
          where: {
            status: OrderStatus.DELIVERED,
          },
        }),
        prisma.orderItem.groupBy({
          by: ['variantId'],
          where: {
            variantId: {
              not: null,
            },
            order: {
              status: OrderStatus.DELIVERED,
            },
          },
          _sum: {
            quantity: true,
          },
          orderBy: {
            _sum: {
              quantity: 'desc',
            },
          },
          take: 5,
        }),
      ]);

    const groupedVariantIds = groupedVariants.flatMap((group) =>
      group.variantId ? [group.variantId] : [],
    );

    const variants = groupedVariantIds.length
      ? await prisma.productVariant.findMany({
          where: {
            id: {
              in: groupedVariantIds,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        })
      : [];

    const soldOrderItems = groupedVariantIds.length
      ? await prisma.orderItem.findMany({
          where: {
            variantId: {
              in: groupedVariantIds,
            },
            order: {
              status: OrderStatus.DELIVERED,
            },
          },
          select: {
            variantId: true,
            quantity: true,
            priceAtPurchase: true,
          },
        })
      : [];

    const revenueByVariantId = new Map<string, number>();

    for (const item of soldOrderItems) {
      if (!item.variantId) {
        continue;
      }

      const itemRevenue = toSafeNumber(item.priceAtPurchase) * item.quantity;
      revenueByVariantId.set(
        item.variantId,
        (revenueByVariantId.get(item.variantId) ?? 0) + itemRevenue,
      );
    }

    const variantsById = new Map(variants.map((variant) => [variant.id, variant]));

    const topVariants = groupedVariants.flatMap((group) => {
      if (!group.variantId) {
        return [];
      }

      const variant = variantsById.get(group.variantId);

      if (!variant) {
        return [];
      }

      const soldQuantity = group._sum.quantity ?? 0;
      const retailPrice = toSafeNumber(variant.retailPrice);

      return [
        {
          variantId: variant.id,
          productId: variant.product.id,
          productName: variant.product.name,
          productSlug: variant.product.slug,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          retailPrice,
          wholesalePrice: toSafeNumber(variant.wholesalePrice),
          stock: variant.stock,
          soldQuantity,
          revenue: revenueByVariantId.get(variant.id) ?? 0,
        },
      ];
    });

    return {
      success: true,
      data: {
        totalRevenue: toSafeNumber(revenueAggregate._sum.totalAmount),
        totalOrders,
        pendingOrders,
        completedOrders,
        topVariants,
      },
    };
  } catch (error) {
    console.error('Failed to fetch admin dashboard:', error);

    return {
      success: false,
      message: 'Không thể tải dữ liệu tổng quan quản trị',
    };
  }
}
