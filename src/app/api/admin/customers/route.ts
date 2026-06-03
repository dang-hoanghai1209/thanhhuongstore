import { Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

const querySchema = z.object({
  search: z.string().trim().optional(),
  role: z.nativeEnum(UserRole).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const patchCustomerSchema = z.object({
  userId: z.string().trim().min(1),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
}).refine((value) => value.role !== undefined || value.isActive !== undefined, {
  message: 'role or isActive is required.',
});

type CustomerListItem = {
  orders: Array<{
    totalAmount: Prisma.Decimal;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

function formatCustomer(user: CustomerListItem) {
  return {
    ...user,
    orders: user.orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
    })),
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = querySchema.safeParse({
      search: request.nextUrl.searchParams.get('search') ?? undefined,
      role: request.nextUrl.searchParams.get('role') ?? undefined,
      page: request.nextUrl.searchParams.get('page') ?? undefined,
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    });

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid customer query.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { search, role, page, limit } = payload.data;
    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [customers, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              addresses: true,
              reviews: true,
            },
          },
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              orderNumber: true,
              status: true,
              paymentStatus: true,
              totalAmount: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      customers: customers.map(formatCustomer),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch customers:', error);

    return NextResponse.json({ error: 'Unable to fetch customers.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = patchCustomerSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid customer update.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { userId, ...data } = payload.data;

    if (userId === authResult.userId && data.isActive === false) {
      return NextResponse.json({ error: 'Admin cannot deactivate own account.' }, { status: 400 });
    }

    const customer = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Failed to update customer:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to update customer.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
