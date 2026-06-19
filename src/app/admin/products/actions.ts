'use server';

import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';

const MAX_SHORT_DESCRIPTION_LENGTH = 300;
const MAX_DESCRIPTION_LENGTH = 3000;

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^a-z0-9\s-]|_)+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalizeOptionalText(value: string | undefined, maxLength: number, fieldLabel: string) {
  const normalized = value?.trim() || null;

  if (normalized && normalized.length > maxLength) {
    throw new Error(`${fieldLabel} không được vượt quá ${maxLength} ký tự`);
  }

  return normalized;
}

export async function createProductAction(data: {
  name: string;
  shortDescription?: string;
  description?: string;
  categoryId: string;
  isActive: boolean;
  images: { url: string; isPrimary: boolean }[];
  variants: {
    sku: string;
    size: string;
    color: string;
    colorHex: string;
    retailPrice: number;
    wholesalePrice: number;
    stock: number;
  }[];
}) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      return { success: false, message: 'Danh mục không tồn tại' };
    }

    const slug = `${slugify(data.name)}-${randomUUID().slice(0, 5)}`;
    const shortDescription = normalizeOptionalText(
      data.shortDescription,
      MAX_SHORT_DESCRIPTION_LENGTH,
      'Mô tả ngắn',
    );
    const description = normalizeOptionalText(
      data.description,
      MAX_DESCRIPTION_LENGTH,
      'Mô tả chi tiết',
    );

    const newProduct = await prisma.$transaction(async (tx) => {
      return tx.product.create({
        data: {
          name: data.name.trim(),
          slug,
          shortDescription,
          description,
          categoryId: data.categoryId,
          sizeType: category.sizeType,
          isActive: data.isActive,
          images: {
            create: data.images.map((img, index) => ({
              url: img.url,
              isPrimary: img.isPrimary,
              sortOrder: index,
            })),
          },
          variants: {
            create: data.variants.map((v) => ({
              sku: v.sku || `SKU-${Date.now()}-${randomUUID().slice(0, 4).toUpperCase()}`,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex,
              retailPrice: v.retailPrice,
              wholesalePrice: v.wholesalePrice,
              stock: v.stock,
            })),
          },
        },
      });
    });

    return { success: true, product: newProduct };
  } catch (error: any) {
    console.error('Error creating product:', error);
    return { success: false, message: error.message || 'Lỗi hệ thống khi tạo sản phẩm' };
  }
}

export async function updateProductAction(
  productId: string,
  data: {
    name: string;
    shortDescription?: string;
    description?: string;
    categoryId: string;
    isActive: boolean;
    images: { url: string; isPrimary: boolean }[];
    variants: {
      id?: string;
      sku: string;
      size: string;
      color: string;
      colorHex: string;
      retailPrice: number;
      wholesalePrice: number;
      stock: number;
    }[];
  }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      return { success: false, message: 'Danh mục không tồn tại' };
    }

    const shortDescription = normalizeOptionalText(
      data.shortDescription,
      MAX_SHORT_DESCRIPTION_LENGTH,
      'Mô tả ngắn',
    );
    const description = normalizeOptionalText(
      data.description,
      MAX_DESCRIPTION_LENGTH,
      'Mô tả chi tiết',
    );

    await prisma.$transaction(async (tx) => {
      // 1. Update basic info
      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name.trim(),
          shortDescription,
          description,
          categoryId: data.categoryId,
          sizeType: category.sizeType,
          isActive: data.isActive,
        },
      });

      // 2. Replace images (simplest is clear and insert)
      await tx.productImage.deleteMany({
        where: { productId },
      });
      await tx.productImage.createMany({
        data: data.images.map((img, index) => ({
          productId,
          url: img.url,
          isPrimary: img.isPrimary,
          sortOrder: index,
        })),
      });

      // 3. Keep current variants, delete outdated ones, update changed ones, insert new ones
      const incomingIds = data.variants.map((v) => v.id).filter(Boolean) as string[];
      await tx.productVariant.deleteMany({
        where: {
          productId,
          id: { notIn: incomingIds },
        },
      });

      for (const v of data.variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex,
              retailPrice: v.retailPrice,
              wholesalePrice: v.wholesalePrice,
              stock: v.stock,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId,
              sku: v.sku || `SKU-${Date.now()}-${randomUUID().slice(0, 4).toUpperCase()}`,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex,
              retailPrice: v.retailPrice,
              wholesalePrice: v.wholesalePrice,
              stock: v.stock,
            },
          });
        }
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return { success: false, message: error.message || 'Lỗi hệ thống khi cập nhật sản phẩm' };
  }
}

export async function toggleProductActiveAction(productId: string, isActive: boolean) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling product status:', error);
    return { success: false, message: error.message || 'Lỗi hệ thống khi cập nhật trạng thái' };
  }
}
