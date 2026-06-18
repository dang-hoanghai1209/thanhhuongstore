import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const relatedProductInclude = {
  category: {
    select: { id: true, name: true, slug: true },
  },
  images: {
    orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
    take: 1,
  },
  variants: {
    select: {
      id: true,
      retailPrice: true,
      stock: true,
    },
    orderBy: [{ retailPrice: 'asc' as const }],
    take: 1,
  },
} satisfies Prisma.ProductInclude;

type RelatedProduct = Prisma.ProductGetPayload<{
  include: typeof relatedProductInclude;
}>;

function toNumber(value: unknown) {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatRelatedProduct(product: RelatedProduct) {
  const variants = product.variants.map((variant) => ({
    ...variant,
    retailPrice: toNumber(variant.retailPrice),
  }));
  const price = variants[0]?.retailPrice ?? 0;
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
  };
}

export async function GET(_request: Request, context: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        slug: context.params.slug,
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        variants: {
          orderBy: [{ retailPrice: 'asc' }, { size: 'asc' }, { color: 'asc' }],
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const variants = product.variants.map((variant) => ({
      ...variant,
      retailPrice: toNumber(variant.retailPrice),
    }));
    const prices = variants.map((variant) => variant.retailPrice).filter((price) => price > 0);
    const price = prices.length > 0 ? Math.min(...prices) : 0;
    const totalStock = variants.reduce((sum, variant) => sum + toNumber(variant.stock), 0);
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        categoryId: product.categoryId,
        isActive: true,
      },
      include: relatedProductInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      take: 8,
    });

    return NextResponse.json({
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
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      relatedProducts: relatedProducts.map(formatRelatedProduct),
    });
  } catch (error) {
    console.error('Failed to fetch product details:', error);
    return NextResponse.json({ error: 'Unable to fetch product details.' }, { status: 500 });
  }
}
