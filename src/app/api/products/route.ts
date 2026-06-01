import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Đảm bảo đường dẫn import prisma này khớp với dự án của bạn

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true, // Chỉ lấy những sản phẩm đang được mở bán
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        images: {
          where: {
            isPrimary: true,
          },
          take: 1, // Lấy 1 ảnh làm ảnh đại diện
        },
        variants: {
          select: {
            retailPrice: true,
            wholesalePrice: true,
            stock: true,
          },
          take: 1, // Chỉ lấy biến thể đầu tiên để hiển thị giá ngoài Trang chủ
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}