import prisma from '@/lib/prisma';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
      variants: {
        orderBy: {
          id: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      sizeType: true,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });

  // Convert decimal values to standard numbers safely for the Client Component
  const formattedProducts = products.map((p) => ({
    ...p,
    variants: p.variants.map((v) => ({
      ...v,
      retailPrice: Number(v.retailPrice),
      wholesalePrice: Number(v.wholesalePrice),
    })),
  }));

  return (
    <ProductsClient
      initialProducts={formattedProducts}
      categories={categories}
    />
  );
}
