'use server';

import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { SizeType } from '@prisma/client';

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

export async function createCategoryAction(data: {
  name: string;
  sizeType: SizeType;
  parentId?: string;
  sortOrder?: number;
  isActive: boolean;
}) {
  try {
    if (!data.name.trim()) {
      return { success: false, message: 'Tên danh mục không được để trống' };
    }

    const slug = `${slugify(data.name)}-${randomUUID().slice(0, 5)}`;

    const newCategory = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        sizeType: data.sizeType,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive,
      },
      include: {
        parent: {
          select: {
            name: true,
          },
        },
      },
    });

    return { success: true, category: newCategory };
  } catch (error: any) {
    console.error('Error creating category:', error);
    return { success: false, message: error.message || 'Lỗi hệ thống khi tạo Danh mục' };
  }
}

export async function toggleCategoryActiveAction(categoryId: string, isActive: boolean) {
  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling category:', error);
    return { success: false, message: error.message || 'Lỗi hệ thống khi cập nhật trạng thái' };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId },
    });

    if (productCount > 0) {
      return { 
        success: false, 
        message: `Không thể xóa danh mục này vì đang có ${productCount} sản phẩm trực thuộc.` 
      };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return { success: false, message: error.message || 'Lỗi hệ thống khi xóa Danh mục' };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  data: {
    name: string;
    sizeType: SizeType;
    parentId?: string | null;
    sortOrder?: number;
    isActive: boolean;
  }
) {
  try {
    if (!data.name.trim()) {
      return { success: false, message: 'Tên danh mục không được để trống' };
    }

    if (data.parentId === categoryId) {
      return { success: false, message: 'Danh mục cha không được trùng với chính nó' };
    }

    const slug = `${slugify(data.name)}-${randomUUID().slice(0, 5)}`;

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        slug,
        sizeType: data.sizeType,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive,
      },
      include: {
        parent: {
          select: {
            name: true,
          },
        },
      },
    });

    return { success: true, category: updatedCategory };
  } catch (error: any) {
    console.error('Error updating category:', error);
    return { success: false, message: error.message || 'Lỗi hệ thống khi cập nhật Danh mục' };
  }
}

