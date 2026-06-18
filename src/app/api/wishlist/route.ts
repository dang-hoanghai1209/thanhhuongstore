import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const productSchema = z.object({
  productId: z.string().trim().min(1),
});

const wishlistInclude = {
  items: {
    include: {
      product: {
        include: {
          category: {
            select: { name: true, slug: true },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          variants: {
            select: { retailPrice: true, stock: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' as const },
  },
} as const;

function formatWishlist<T extends {
  items: Array<{ product: { variants: Array<{ retailPrice: unknown }> } }>;
}>(wishlist: T) {
  return {
    ...wishlist,
    items: wishlist.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        variants: item.product.variants.map((variant) => ({
          ...variant,
          retailPrice: Number(variant.retailPrice),
        })),
      },
    })),
  };
}

async function getWishlist(userId: string) {
  return prisma.wishlist.findUnique({
    where: { userId },
    include: wishlistInclude,
  });
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const wishlist = await getWishlist(authResult.userId);
    return NextResponse.json(wishlist ? formatWishlist(wishlist) : { items: [] });
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
    return NextResponse.json({ error: 'Unable to fetch wishlist.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = productSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: payload.data.productId, isActive: true },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const wishlist = await prisma.wishlist.upsert({
      where: { userId: authResult.userId },
      update: {},
      create: { userId: authResult.userId },
    });

    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        wishlistId: wishlist.id,
        productId: product.id,
      },
    });

    const updatedWishlist = await getWishlist(authResult.userId);
    return NextResponse.json(updatedWishlist ? formatWishlist(updatedWishlist) : { items: [] }, {
      status: 201,
    });
  } catch (error) {
    console.error('Failed to add wishlist item:', error);
    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to add wishlist item.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = productSchema.safeParse({
      productId: request.nextUrl.searchParams.get('productId'),
    });

    if (!payload.success) {
      return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        productId: payload.data.productId,
        wishlist: { userId: authResult.userId },
      },
    });

    const wishlist = await getWishlist(authResult.userId);
    return NextResponse.json(wishlist ? formatWishlist(wishlist) : { items: [] });
  } catch (error) {
    console.error('Failed to delete wishlist item:', error);
    return NextResponse.json({ error: 'Unable to delete wishlist item.' }, { status: 500 });
  }
}
