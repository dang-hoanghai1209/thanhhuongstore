import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = params;
  
  const product = await prisma.product.findUnique({
    where: { 
      slug,
      isActive: true 
    },
    select: {
      name: true,
      shortDescription: true,
      category: {
        select: {
          name: true
        }
      },
      images: {
        select: {
          url: true,
          isPrimary: true
        }
      }
    }
  });

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm - Hoàng Hải Sneaker',
    };
  }

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ogImageUrl = primaryImage
    ? primaryImage.url.startsWith('http')
      ? primaryImage.url
      : `${baseUrl}${primaryImage.url}`
    : `${baseUrl}/images/default-product.jpg`;

  const metaDescription =
    product.shortDescription?.trim() ||
    `Xem thông tin, hình ảnh và giá bán ${product.name} tại Hoàng Hải Sneaker. Liên hệ để được tư vấn mẫu còn sẵn.`;

  return {
    title: `${product.name} | Hoàng Hải Sneaker`,
    description: metaDescription,
    alternates: {
      canonical: `${baseUrl}/products/${slug}`,
    },
    openGraph: {
      title: `${product.name} | Hoàng Hải Sneaker`,
      description: metaDescription,
      images: [
        {
          url: ogImageUrl,
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
      type: 'website',
      url: `${baseUrl}/products/${slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = params;

  // Query product directly from database using Prisma client
  const product = await prisma.product.findUnique({
    where: { 
      slug,
      isActive: true 
    },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' }
      },
      variants: {
        orderBy: { size: 'asc' }
      }
    }
  });

  // Display Next.js global notFound page if product does not exist
  if (!product) {
    notFound();
  }

  // CRITICAL RULE: Wrap all Prisma Decimals with Number() to prevent hydration or type serialization errors
  const { wholesaleTiers: _wholesaleTiers, ...publicProduct } = product;
  const serializedProduct = {
    ...publicProduct,
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      retailPrice: Number(v.retailPrice),
      stock: v.stock,
    })),
  };

  return <ProductDetailClient product={serializedProduct} />;
}
