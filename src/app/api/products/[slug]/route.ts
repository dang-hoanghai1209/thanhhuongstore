import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
          orderBy: [{ size: 'asc' }, { color: 'asc' }],
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      variants: product.variants.map((variant) => ({
        ...variant,
        retailPrice: Number(variant.retailPrice),
        wholesalePrice: Number(variant.wholesalePrice),
      })),
    });
  } catch (error) {
    console.error('Failed to fetch product details:', error);
    return NextResponse.json({ error: 'Unable to fetch product details.' }, { status: 500 });
  }
}
