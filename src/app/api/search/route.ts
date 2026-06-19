import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

const productInclude = {
  category: {
    select: { id: true, name: true, slug: true },
  },
  images: {
    orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
  },
  variants: {
    select: {
      id: true,
      sku: true,
      size: true,
      color: true,
      colorHex: true,
      retailPrice: true,
      stock: true,
    },
    orderBy: [{ retailPrice: 'asc' as const }],
  },
} satisfies Prisma.ProductInclude;

type SearchProduct = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

function toNumber(value: unknown) {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatProduct(product: SearchProduct) {
  const variants = product.variants.map((variant) => ({
    ...variant,
    retailPrice: toNumber(variant.retailPrice),
  }));
  const prices = variants.map((variant) => variant.retailPrice).filter((price) => price > 0);
  const price = prices.length > 0 ? Math.min(...prices) : 0;
  const totalStock = variants.reduce((sum, variant) => sum + toNumber(variant.stock), 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    price,
    salePrice: null,
    finalPrice: price,
    images: product.images,
    category: product.category,
    variants,
    stock: totalStock,
    totalStock,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
  };
}

export async function GET(request: NextRequest) {
  try {
    const payload = searchSchema.safeParse({
      q: request.nextUrl.searchParams.get('q'),
      page: request.nextUrl.searchParams.get('page') ?? undefined,
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    });

    if (!payload.success) {
      return NextResponse.json({ error: 'Search query is required.' }, { status: 400 });
    }

    const { q, page, limit } = payload.data;
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      category: {
        isActive: true,
      },
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
      ],
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    const items = products.map(formatProduct);

    return NextResponse.json({
      items,
      products: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        q,
        category: '',
        minPrice: null,
        maxPrice: null,
        sort: 'newest',
      },
    });
  } catch (error) {
    console.error('Failed to search products:', error);
    return NextResponse.json({ error: 'Unable to search products.' }, { status: 500 });
  }
}
