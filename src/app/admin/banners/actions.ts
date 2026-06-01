'use server';

import prisma from '@/lib/prisma';

export async function createBannerAction(data: {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder?: number;
}) {
  try {
    if (!data.title.trim()) {
      return { success: false, message: 'Tiêu đề không được để trống' };
    }
    if (!data.imageUrl.trim()) {
      return { success: false, message: 'Đường dẫn hình ảnh không được để trống' };
    }

    const newBanner = await prisma.banner.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        isActive: data.isActive,
        sortOrder: data.sortOrder || 0,
      },
    });

    return { success: true, banner: newBanner };
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return { success: false, message: error.message || 'Lỗi hệ thống khi tạo Banner' };
  }
}

export async function toggleBannerActiveAction(bannerId: string, isActive: boolean) {
  try {
    await prisma.banner.update({
      where: { id: bannerId },
      data: { isActive },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling banner:', error);
    return { success: false, message: error.message || 'Lỗi hệ thống khi cập nhật trạng thái' };
  }
}

export async function deleteBannerAction(bannerId: string) {
  try {
    await prisma.banner.delete({
      where: { id: bannerId },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return { success: false, message: error.message || 'Lỗi hệ thống khi xóa Banner' };
  }
}
