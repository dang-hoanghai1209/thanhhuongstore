import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';

interface ProductDetailPageProps {
  params: {
    slug: string;
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
  const serializedProduct = {
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      retailPrice: Number(v.retailPrice),
      wholesalePrice: Number(v.wholesalePrice),
    })),
  };

  return <ProductDetailClient product={serializedProduct} />;
}
