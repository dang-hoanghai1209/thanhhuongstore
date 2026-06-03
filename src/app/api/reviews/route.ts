import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const listReviewsSchema = z.object({
  productId: z.string().trim().min(1),
});

const createReviewSchema = z.object({
  productId: z.string().trim().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const payload = listReviewsSchema.safeParse({
      productId: request.nextUrl.searchParams.get('productId'),
    });

    if (!payload.success) {
      return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: payload.data.productId,
        isApproved: true,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        isVerified: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Unable to fetch reviews.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = createReviewSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid review data.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const product = await prisma.product.findFirst({
      where: { id: payload.data.productId, isActive: true },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const verifiedPurchase = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: authResult.userId,
          status: 'DELIVERED',
        },
      },
      select: { id: true },
    });
    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: authResult.userId,
        rating: payload.data.rating,
        comment: payload.data.comment,
        isVerified: Boolean(verifiedPurchase),
        isApproved: false,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to create review.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
