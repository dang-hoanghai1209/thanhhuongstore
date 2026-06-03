import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

const variantSchema = z.object({
  id: z.string().trim().min(1).optional(),
  sku: z.string().trim().min(1).optional(),
  color: z.string().trim().min(1, 'Màu sắc không được để trống'),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Mã màu phải có định dạng #RRGGBB')
    .default('#000000'),
  size: z.string().trim().min(1, 'Kích thước không được để trống'),
  retailPrice: z.coerce.number().positive('Giá bán lẻ phải lớn hơn 0'),
  wholesalePrice: z.coerce.number().positive('Giá bán sỉ phải lớn hơn 0').optional(),
  stock: z.coerce.number().int().nonnegative('Tồn kho không được âm'),
});

const imageSchema = z.object({
  url: z.string().trim().url('URL ảnh không hợp lệ'),
  isPrimary: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

const wholesaleTierSchema = z.object({
  minQty: z.coerce.number().int().positive('Số lượng tối thiểu phải lớn hơn 0'),
  discount: z.coerce.number().min(0).max(100, 'Chiết khấu không được vượt quá 100'),
});

const productFieldsSchema = z.object({
  name: z.string().trim().min(1, 'Tên sản phẩm không được để trống'),
  slug: z.string().trim().min(1).optional(),
  categoryId: z.string().trim().min(1, 'Danh mục không được để trống'),
  sizeType: z.enum(['SOCK', 'SWIMWEAR', 'UNDERWEAR', 'SHOE', 'ACCESSORY']),
  wholesaleTiers: z.array(wholesaleTierSchema).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const createProductSchema = productFieldsSchema.extend({
  variants: z.array(variantSchema).min(1, 'Sản phẩm phải có ít nhất một biến thể'),
  images: z.array(imageSchema).optional(),
});

const updateProductSchema = productFieldsSchema.partial().extend({
  productId: z.string().trim().min(1, 'productId không được để trống'),
  variants: z.array(variantSchema).optional(),
  deletedVariantIds: z.array(z.string().trim().min(1)).optional(),
  images: z.array(imageSchema).optional(),
});

const deleteProductSchema = z.object({
  productId: z.string().trim().min(1, 'productId không được để trống'),
  hard: z.coerce.boolean().default(false),
});

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createSku(slug: string, index: number) {
  const suffix = randomUUID().slice(0, 6).toUpperCase();
  return `${slug.toUpperCase()}-${String(index + 1).padStart(2, '0')}-${suffix}`;
}

function toVariantData(
  variant: z.infer<typeof variantSchema>,
  productSlug: string,
  index: number,
) {
  return {
    sku: variant.sku ?? createSku(productSlug, index),
    color: variant.color,
    colorHex: variant.colorHex,
    size: variant.size,
    retailPrice: variant.retailPrice,
    wholesalePrice: variant.wholesalePrice ?? variant.retailPrice,
    stock: variant.stock,
  };
}

async function authorize(request: NextRequest) {
  return requireAdmin(request);
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorize(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: {
          orderBy: {
            sku: 'asc',
          },
        },
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch admin products:', error);

    return NextResponse.json(
      { message: 'Không thể lấy danh sách sản phẩm' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorize(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = createProductSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        {
          message: 'Dữ liệu sản phẩm không hợp lệ',
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { variants, images, ...productData } = payload.data;
    const slug = productData.slug ?? `${slugify(productData.name)}-${randomUUID().slice(0, 8)}`;

    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          ...productData,
          slug,
        } satisfies Prisma.ProductUncheckedCreateInput,
      });

      await tx.productVariant.createMany({
        data: variants.map((variant, index) => ({
          ...toVariantData(variant, slug, index),
          productId: createdProduct.id,
        })),
      });

      if (images?.length) {
        await tx.productImage.createMany({
          data: images.map((image) => ({
            ...image,
            productId: createdProduct.id,
          })),
        });
      }

      return tx.product.findUniqueOrThrow({
        where: {
          id: createdProduct.id,
        },
        include: {
          category: true,
          variants: true,
          images: true,
        },
      });
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create admin product:', error);

    return NextResponse.json(
      { message: 'Không thể tạo sản phẩm' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authorize(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = updateProductSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        {
          message: 'Dữ liệu cập nhật không hợp lệ',
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { productId, variants, deletedVariantIds, images, ...productData } = payload.data;

    const product = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: {
          id: productId,
        },
        data: productData satisfies Prisma.ProductUncheckedUpdateInput,
      });

      if (deletedVariantIds?.length) {
        await tx.productVariant.deleteMany({
          where: {
            id: {
              in: deletedVariantIds,
            },
            productId,
          },
        });
      }

      if (variants) {
        for (const [index, variant] of variants.entries()) {
          const variantData = toVariantData(variant, updatedProduct.slug, index);

          if (variant.id) {
            const updatedVariant = await tx.productVariant.updateMany({
              where: {
                id: variant.id,
                productId,
              },
              data: variantData,
            });

            if (updatedVariant.count !== 1) {
              throw new Error('Biến thể không thuộc sản phẩm cần cập nhật');
            }
          } else {
            await tx.productVariant.create({
              data: {
                ...variantData,
                productId,
              },
            });
          }
        }
      }

      if (images) {
        await tx.productImage.deleteMany({
          where: {
            productId,
          },
        });

        if (images.length) {
          await tx.productImage.createMany({
            data: images.map((image) => ({
              ...image,
              productId,
            })),
          });
        }
      }

      return tx.product.findUniqueOrThrow({
        where: {
          id: productId,
        },
        include: {
          category: true,
          variants: true,
          images: true,
        },
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to update admin product:', error);

    return NextResponse.json(
      { message: 'Không thể cập nhật sản phẩm' },
      { status: 500 },
    );
  }
}

export const PUT = PATCH;

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authorize(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const payload = deleteProductSchema.safeParse({
      productId: request.nextUrl.searchParams.get('productId'),
      hard: request.nextUrl.searchParams.get('hard') ?? false,
    });

    if (!payload.success) {
      return NextResponse.json(
        {
          message: 'Dữ liệu xóa sản phẩm không hợp lệ',
          errors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (payload.data.hard) {
      const linkedRecords = await prisma.product.findUnique({
        where: {
          id: payload.data.productId,
        },
        select: {
          variants: {
            select: {
              _count: {
                select: {
                  cartItems: true,
                  orderItems: true,
                },
              },
            },
          },
          _count: {
            select: {
              wishlistItems: true,
              reviews: true,
            },
          },
        },
      });

      if (!linkedRecords) {
        return NextResponse.json(
          { message: 'Không tìm thấy sản phẩm' },
          { status: 404 },
        );
      }

      const hasLinkedRecords =
        linkedRecords._count.wishlistItems > 0 ||
        linkedRecords._count.reviews > 0 ||
        linkedRecords.variants.some(
          (variant) => variant._count.cartItems > 0 || variant._count.orderItems > 0,
        );

      if (hasLinkedRecords) {
        return NextResponse.json(
          { message: 'Sản phẩm đã phát sinh giao dịch, chỉ có thể ngừng bán' },
          { status: 409 },
        );
      }

      await prisma.product.delete({
        where: {
          id: payload.data.productId,
        },
      });

      return NextResponse.json({
        productId: payload.data.productId,
        deleted: true,
      });
    }

    const product = await prisma.product.update({
      where: {
        id: payload.data.productId,
      },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to delete admin product:', error);

    return NextResponse.json(
      { message: 'Không thể xóa sản phẩm' },
      { status: 500 },
    );
  }
}
