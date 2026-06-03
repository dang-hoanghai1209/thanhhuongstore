import { OrderStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  range: z.enum(['7d', '30d', 'all']).default('30d'),
  lowStockThreshold: z.coerce.number().int().nonnegative().max(1000).default(10),
});

function getRangeStart(range: '7d' | '30d' | 'all') {
  if (range === 'all') {
    return undefined;
  }

  const days = range === '7d' ? 7 : 30;
  const start = new Date();

  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  return start;
}

function toNumber(value: unknown) {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createRevenueSeries(start: Date | undefined, now: Date) {
  if (!start) {
    return new Map<string, number>();
  }

  const series = new Map<string, number>();
  const current = new Date(start);

  while (current <= now) {
    series.set(getDateKey(current), 0);
    current.setDate(current.getDate() + 1);
  }

  return series;
}

function createEmptyAnalyticsContract() {
  return {
    summary: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
    },
    ordersByStatus: [] as Array<{ status: string; count: number }>,
    revenueByDay: [] as Array<{ date: string; revenue: number }>,
    lowStockProducts: [] as Array<Record<string, never>>,
    recentOrders: [] as Array<Record<string, never>>,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = querySchema.safeParse({
      range: request.nextUrl.searchParams.get('range') ?? undefined,
      lowStockThreshold: request.nextUrl.searchParams.get('lowStockThreshold') ?? undefined,
    });

    if (!payload.success) {
      return NextResponse.json(
        {
          error: 'Invalid analytics query.',
          details: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { range, lowStockThreshold } = payload.data;
    const now = new Date();
    const rangeStart = getRangeStart(range);
    const createdAtFilter: Prisma.DateTimeFilter | undefined = rangeStart
      ? {
          gte: rangeStart,
          lte: now,
        }
      : undefined;
    const orderRangeWhere: Prisma.OrderWhereInput = createdAtFilter
      ? { createdAt: createdAtFilter }
      : {};
    const deliveredOrderWhere: Prisma.OrderWhereInput = {
      ...orderRangeWhere,
      status: OrderStatus.DELIVERED,
    };

    const [
      revenueAggregate,
      totalOrders,
      totalCustomers,
      totalProducts,
      ordersByStatus,
      deliveredOrders,
      lowStockVariants,
      recentOrders,
    ] = await prisma.$transaction([
      prisma.order.aggregate({
        where: deliveredOrderWhere,
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.count({
        where: orderRangeWhere,
      }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
        },
      }),
      prisma.product.count({
        where: {
          isActive: true,
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: orderRangeWhere,
        _count: {
          _all: true,
        },
        orderBy: {
          status: 'asc',
        },
      }),
      prisma.order.findMany({
        where: deliveredOrderWhere,
        select: {
          createdAt: true,
          totalAmount: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.productVariant.findMany({
        where: {
          stock: {
            lte: lowStockThreshold,
          },
          product: {
            isActive: true,
          },
        },
        select: {
          id: true,
          sku: true,
          size: true,
          color: true,
          stock: true,
          retailPrice: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: {
                  isPrimary: true,
                },
                select: {
                  url: true,
                },
                take: 1,
              },
            },
          },
        },
        orderBy: [{ stock: 'asc' }, { updatedAt: 'desc' }],
        take: 20,
      }),
      prisma.order.findMany({
        where: orderRangeWhere,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          phoneNumber: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          totalAmount: true,
          createdAt: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
    ]);

    const revenueByDate = createRevenueSeries(rangeStart, now);

    for (const order of deliveredOrders) {
      const date = getDateKey(order.createdAt);

      revenueByDate.set(date, (revenueByDate.get(date) ?? 0) + toNumber(order.totalAmount));
    }

    const orderStatusCounts = Object.fromEntries(
      Object.values(OrderStatus).map((status) => [status, 0]),
    ) as Record<OrderStatus, number>;

    for (const group of ordersByStatus) {
      orderStatusCounts[group.status] =
        typeof group._count === 'object' ? group._count?._all ?? 0 : 0;
    }

    const summary = {
      totalRevenue: toNumber(revenueAggregate._sum.totalAmount),
      totalOrders: toNumber(totalOrders),
      totalCustomers: toNumber(totalCustomers),
      totalProducts: toNumber(totalProducts),
    };
    const ordersByStatusList = Object.entries(orderStatusCounts).map(([status, count]) => ({
      status,
      count: toNumber(count),
    }));
    const revenueByDay = Array.from(revenueByDate, ([date, revenue]) => ({
      date,
      revenue: toNumber(revenue),
    }));
    const lowStockProducts = lowStockVariants.map((variant) => ({
      variantId: variant.id,
      productId: variant.product.id,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      imageUrl: variant.product.images[0]?.url ?? null,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      stock: toNumber(variant.stock),
      retailPrice: toNumber(variant.retailPrice),
    }));
    const normalizedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalAmount: toNumber(order.totalAmount),
      createdAt: order.createdAt,
      itemCount: toNumber(order._count.items),
    }));

    return NextResponse.json({
      range,
      period: {
        from: rangeStart?.toISOString() ?? null,
        to: now.toISOString(),
      },
      summary,
      ordersByStatus: ordersByStatusList,
      revenueByDay,
      lowStockProducts,
      recentOrders: normalizedRecentOrders,
      overview: summary,
      orderStatusBreakdown: orderStatusCounts,
      revenueByDate: revenueByDay,
    });
  } catch (error) {
    console.error('Failed to fetch admin analytics:', error);

    return NextResponse.json(
      {
        ...createEmptyAnalyticsContract(),
        error: 'Unable to fetch admin analytics.',
      },
      { status: 500 },
    );
  }
}
