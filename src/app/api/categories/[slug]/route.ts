import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
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
      wholesalePrice: true,
      stock: true,
    },
    orderBy: [{ retailPrice: 'asc' as const }],
  },
} satisfies Prisma.ProductInclude;

type CategoryProduct = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

function toNumber(value: unknown) {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatProduct(product: CategoryProduct) {
  const variants = product.variants.map((variant) => ({
    ...variant,
    retailPrice: toNumber(variant.retailPrice),
    wholesalePrice: toNumber(variant.wholesalePrice),
  }));
  const prices = variants.map((variant) => variant.retailPrice).filter((price) => price > 0);
  const price = prices.length > 0 ? Math.min(...prices) : 0;
  const totalStock = variants.reduce((sum, variant) => sum + toNumber(variant.stock), 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: null,
    shortDescription: null,
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

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } },
) {
  try {
    const payload = querySchema.safeParse({
      page: request.nextUrl.searchParams.get('page') ?? undefined,
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    });

    if (!payload.success) {
      return NextResponse.json(
        {
          error: 'Invalid category query.',
          details: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const category = await prisma.category.findFirst({
      where: {
        slug: context.params.slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sizeType: true,
        sortOrder: true,
        parentId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    const { page, limit } = payload.data;
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      categoryId: category.id,
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
    const formattedProducts = products.map(formatProduct);

    return NextResponse.json({
      ...category,
      description: null,
      products: formattedProducts,
      items: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch category details:', error);
    return NextResponse.json({ error: 'Unable to fetch category details.' }, { status: 500 });
  }
}
