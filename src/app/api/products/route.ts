import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const querySchema = z
  .object({
    category: z.string().trim().min(1).max(100).optional(),
    search: z.string().trim().min(1).max(100).optional(),
    minPrice: z.coerce.number().finite().nonnegative().optional(),
    maxPrice: z.coerce.number().finite().nonnegative().optional(),
    sort: z
      .enum(['newest', 'oldest', 'name-asc', 'name-desc', 'price-asc', 'price-desc'])
      .default('newest'),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(24),
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
    where: {
      isPrimary: true,
    },
    orderBy: {
      sortOrder: 'asc' as const,
    },
    take: 1,
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
    orderBy: {
      retailPrice: 'asc' as const,
    },
    take: 1,
  },
} as const;

type ListedProduct = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

function formatProduct(product: ListedProduct) {
  return {
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      retailPrice: Number(variant.retailPrice),
      wholesalePrice: Number(variant.wholesalePrice),
    })),
  };
}

function getProductOrderBy(
  sort: 'newest' | 'oldest' | 'name-asc' | 'name-desc',
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'oldest':
      return [{ createdAt: 'asc' }, { id: 'asc' }];
    case 'name-asc':
      return [{ name: 'asc' }, { id: 'asc' }];
    case 'name-desc':
      return [{ name: 'desc' }, { id: 'asc' }];
    case 'newest':
      return [{ createdAt: 'desc' }, { id: 'asc' }];
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = querySchema.safeParse({
      category: request.nextUrl.searchParams.get('category') ?? undefined,
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

    const { category, search, minPrice, maxPrice, sort, page, limit } = payload.data;
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
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                slug: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
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

    if (sort === 'price-asc' || sort === 'price-desc') {
      const priceDirection = sort === 'price-asc' ? 'asc' : 'desc';
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

    return NextResponse.json({
      products: products.map(formatProduct),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch product catalog:', error);

    return NextResponse.json({ error: 'Unable to fetch product catalog.' }, { status: 500 });
  }
}
