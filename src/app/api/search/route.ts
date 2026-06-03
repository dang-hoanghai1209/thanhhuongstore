import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100),
});

export async function GET(request: NextRequest) {
  try {
    const payload = searchSchema.safeParse({
      q: request.nextUrl.searchParams.get('q'),
    });

    if (!payload.success) {
      return NextResponse.json({ error: 'Search query is required.' }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        name: {
          contains: payload.data.q,
          mode: 'insensitive',
        },
      },
      include: {
        category: {
          select: { name: true, slug: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        variants: {
          select: { retailPrice: true, wholesalePrice: true, stock: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return NextResponse.json(
      products.map((product) => ({
        ...product,
        variants: product.variants.map((variant) => ({
          ...variant,
          retailPrice: Number(variant.retailPrice),
          wholesalePrice: Number(variant.wholesalePrice),
        })),
      })),
    );
  } catch (error) {
    console.error('Failed to search products:', error);
    return NextResponse.json({ error: 'Unable to search products.' }, { status: 500 });
  }
}
