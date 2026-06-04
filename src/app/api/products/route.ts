import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const sortValues = [
  'newest',
  'oldest',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
  'popular',
] as const;

const querySchema = z
  .object({
    category: z.string().trim().min(1).max(100).optional(),
    categorySlug: z.string().trim().min(1).max(100).optional(),
    q: z.string().trim().min(1).max(100).optional(),
    search: z.string().trim().min(1).max(100).optional(),
    minPrice: z.coerce.number().finite().nonnegative().optional(),
    maxPrice: z.coerce.number().finite().nonnegative().optional(),
    sort: z
      .preprocess(
        (value) => String(value ?? 'newest').replaceAll('-', '_'),
        z.enum(sortValues),
      )
      .default('newest'),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),
  })
  .superRefine((value, context) => {
    if (
      value.minPrice !== undefined &&
      value.maxPrice !== undefined &&
      value.minPrice > value.maxPrice
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minPrice'],
        message: 'minPrice cannot be greater than maxPrice.',
      });
    }
  });

const productInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
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
    orderBy: [{ retailPrice: 'asc' as const }, { size: 'asc' as const }, { color: 'asc' as const }],
  },
} satisfies Prisma.ProductInclude;

type ListedProduct = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

function toNumber(value: unknown) {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatProduct(product: ListedProduct) {
  const variants = product.variants.map((variant) => ({
    ...variant,
    retailPrice: toNumber(variant.retailPrice),
    wholesalePrice: toNumber(variant.wholesalePrice),
  }));
  const variantPrices = variants.map((variant) => variant.retailPrice).filter((price) => price > 0);
  const price = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
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
    wholesaleTiers: product.wholesaleTiers,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function getProductOrderBy(
  sort: (typeof sortValues)[number],
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'oldest':
      return [{ createdAt: 'asc' }, { id: 'asc' }];
    case 'name_asc':
      return [{ name: 'asc' }, { id: 'asc' }];
    case 'name_desc':
      return [{ name: 'desc' }, { id: 'asc' }];
    case 'popular':
    case 'newest':
    case 'price_asc':
    case 'price_desc':
      return [{ createdAt: 'desc' }, { id: 'asc' }];
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = querySchema.safeParse({
      category: request.nextUrl.searchParams.get('category') ?? undefined,
      categorySlug: request.nextUrl.searchParams.get('categorySlug') ?? undefined,
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      search: request.nextUrl.searchParams.get('search') ?? undefined,
      minPrice: request.nextUrl.searchParams.get('minPrice') ?? undefined,
      maxPrice: request.nextUrl.searchParams.get('maxPrice') ?? undefined,
      sort: request.nextUrl.searchParams.get('sort') ?? undefined,
      page: request.nextUrl.searchParams.get('page') ?? undefined,
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    });

    if (!payload.success) {
      return NextResponse.json(
        {
          error: 'Invalid product catalog query.',
          details: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { minPrice, maxPrice, sort, page, limit } = payload.data;
    const category = payload.data.category ?? payload.data.categorySlug ?? '';
    const q = payload.data.q ?? payload.data.search ?? '';
    const skip = (page - 1) * limit;
    const retailPriceFilter: Prisma.DecimalFilter | undefined =
      minPrice !== undefined || maxPrice !== undefined
        ? {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          }
        : undefined;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      category: {
        isActive: true,
        ...(category ? { slug: category } : {}),
      },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
              { category: { name: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...(retailPriceFilter
        ? {
            variants: {
              some: {
                retailPrice: retailPriceFilter,
              },
            },
          }
        : {}),
    };

    let products: ListedProduct[];
    let total: number;

    if (sort === 'price_asc' || sort === 'price_desc') {
      const priceDirection = sort === 'price_asc' ? 'asc' : 'desc';
      const [groupedVariants, productCount] = await prisma.$transaction([
        prisma.productVariant.groupBy({
          by: ['productId'],
          where: {
            product: where,
            ...(retailPriceFilter ? { retailPrice: retailPriceFilter } : {}),
          },
          _min: {
            retailPrice: true,
          },
          orderBy: [
            {
              _min: {
                retailPrice: priceDirection,
              },
            },
            {
              productId: 'asc',
            },
          ],
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);
      const productIds = groupedVariants.map((variant) => variant.productId);
      const productOrder = new Map(productIds.map((productId, index) => [productId, index]));
      const fetchedProducts = await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
        include: productInclude,
      });

      products = fetchedProducts.sort(
        (left, right) => (productOrder.get(left.id) ?? 0) - (productOrder.get(right.id) ?? 0),
      );
      total = productCount;
    } else {
      [products, total] = await prisma.$transaction([
        prisma.product.findMany({
          where,
          include: productInclude,
          orderBy: getProductOrderBy(sort),
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);
    }

    const formattedProducts = products.map(formatProduct);
    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    const filters = {
      q,
      category,
      minPrice: minPrice ?? null,
      maxPrice: maxPrice ?? null,
      sort,
    };

    return NextResponse.json({
      items: formattedProducts,
      products: formattedProducts,
      pagination,
      filters,
    });
  } catch (error) {
    console.error('Failed to fetch product catalog:', error);

    return NextResponse.json({ error: 'Unable to fetch product catalog.' }, { status: 500 });
  }
}
