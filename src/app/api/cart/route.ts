import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const addItemSchema = z.object({
  variantId: z.string().trim().min(1),
  quantity: z.coerce.number().int().positive(),
});

const updateItemSchema = z.object({
  itemId: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional(),
  quantity: z.coerce.number().int().positive(),
}).refine((value) => value.itemId || value.variantId, {
  message: 'itemId or variantId is required.',
});

const deleteItemSchema = z.object({
  itemId: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional(),
  clear: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
});

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' as const },
  },
} as const;

function formatCart<
  T extends {
    items: Array<{
      quantity: unknown;
      variant: { retailPrice: unknown };
    }>;
  },
>(
  cart: T,
) {
  const items = cart.items.map((item) => {
    const { wholesalePrice: _wholesalePrice, ...variant } = item.variant as typeof item.variant & {
      wholesalePrice?: unknown;
    };

    return {
      ...item,
      variant: {
        ...variant,
        retailPrice: Number(item.variant.retailPrice),
      },
    };
  });
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.variant.retailPrice) * Number(item.quantity ?? 0),
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);

  return {
    ...cart,
    items,
    subtotal,
    total: subtotal,
    itemCount,
  };
}

async function getCart(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const cart = await getCart(authResult.userId);

    return NextResponse.json(cart ? formatCart(cart) : { items: [], subtotal: 0, total: 0, itemCount: 0 });
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return NextResponse.json({ error: 'Unable to fetch cart.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = addItemSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid cart item.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: {
          id: payload.data.variantId,
          product: { isActive: true },
        },
        select: { id: true, stock: true },
      });

      if (!variant) {
        throw new Error('VARIANT_NOT_FOUND');
      }

      const cart = await tx.cart.upsert({
        where: { userId: authResult.userId },
        update: {},
        create: { userId: authResult.userId },
      });
      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId: variant.id,
          },
        },
      });
      const nextQuantity = (existingItem?.quantity ?? 0) + payload.data.quantity;

      if (nextQuantity > variant.stock) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      await tx.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId: variant.id,
          },
        },
        update: { quantity: nextQuantity },
        create: {
          cartId: cart.id,
          variantId: variant.id,
          quantity: nextQuantity,
        },
      });
    });

    const cart = await getCart(authResult.userId);
    return NextResponse.json(
      cart ? formatCart(cart) : { items: [], subtotal: 0, total: 0, itemCount: 0 },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to add cart item:', error);

    if (error instanceof Error && error.message === 'VARIANT_NOT_FOUND') {
      return NextResponse.json({ error: 'Product variant not found or inactive.' }, { status: 404 });
    }

    if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
      return NextResponse.json({ error: 'Requested quantity exceeds available stock.' }, { status: 409 });
    }

    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to add cart item.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = updateItemSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid cart item.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updateResult = await prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({
        where: {
          ...(payload.data.itemId ? { id: payload.data.itemId } : { variantId: payload.data.variantId }),
          cart: { userId: authResult.userId },
        },
        include: {
          variant: {
            select: {
              stock: true,
              product: {
                select: { isActive: true },
              },
            },
          },
        },
      });

      if (!item) {
        return 'NOT_FOUND';
      }

      if (!item.variant.product.isActive) {
        return 'INACTIVE';
      }

      if (item.variant.stock < payload.data.quantity) {
        return 'INSUFFICIENT_STOCK';
      }

      await tx.cartItem.update({
        where: { id: item.id },
        data: { quantity: payload.data.quantity },
      });

      return 'UPDATED';
    });

    if (updateResult === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Cart item not found.' }, { status: 404 });
    }

    if (updateResult === 'INACTIVE') {
      return NextResponse.json({ error: 'Product is inactive.' }, { status: 409 });
    }

    if (updateResult === 'INSUFFICIENT_STOCK') {
      return NextResponse.json({ error: 'Requested quantity exceeds available stock.' }, { status: 409 });
    }

    const cart = await getCart(authResult.userId);
    return NextResponse.json(cart ? formatCart(cart) : { items: [], subtotal: 0, total: 0, itemCount: 0 });
  } catch (error) {
    console.error('Failed to update cart item:', error);
    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to update cart item.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}

export const PUT = PATCH;

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json().catch(() => ({}));
    const payload = deleteItemSchema.safeParse({
      ...body,
      itemId: body.itemId ?? request.nextUrl.searchParams.get('itemId') ?? undefined,
      variantId: body.variantId ?? request.nextUrl.searchParams.get('variantId') ?? undefined,
      clear: body.clear ?? request.nextUrl.searchParams.get('clear') ?? undefined,
    });
    const shouldClearCart = payload.success && (payload.data.clear === true || payload.data.clear === 'true');

    if (!payload.success || (!payload.data.itemId && !payload.data.variantId && !shouldClearCart)) {
      return NextResponse.json({ error: 'itemId, variantId, or clear=true is required.' }, { status: 400 });
    }

    if (shouldClearCart) {
      await prisma.cartItem.deleteMany({
        where: { cart: { userId: authResult.userId } },
      });
    } else {
      const deletedItem = await prisma.cartItem.deleteMany({
        where: {
          ...(payload.data.itemId ? { id: payload.data.itemId } : { variantId: payload.data.variantId }),
          cart: { userId: authResult.userId },
        },
      });

      if (deletedItem.count !== 1) {
        return NextResponse.json({ error: 'Cart item not found.' }, { status: 404 });
      }
    }

    const cart = await getCart(authResult.userId);
    return NextResponse.json(cart ? formatCart(cart) : { items: [], subtotal: 0, total: 0, itemCount: 0 });
  } catch (error) {
    console.error('Failed to delete cart item:', error);
    return NextResponse.json({ error: 'Unable to delete cart item.' }, { status: 500 });
  }
}
