import prisma from '@/lib/prisma';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // 1. Stats Queries
  // Sum of completed orders (status: DELIVERED)
  const completedOrders = await prisma.order.findMany({
    where: {
      status: 'DELIVERED',
    },
    select: {
      totalAmount: true,
    },
  });
  
  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  );
  
  const totalOrders = await prisma.order.count();
  
  const pendingOrders = await prisma.order.count({
    where: {
      status: 'PENDING',
    },
  });
  
  const totalProducts = await prisma.product.count();

  // 2. Top 5 Selling Products Query (aggregated from order items)
  const bestSellersGrouped = await prisma.orderItem.groupBy({
    by: ['productId', 'productName'],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: 5,
  });

  const topProductIds = bestSellersGrouped.map((item) => item.productId);

  const topProductsInfo = await prisma.product.findMany({
    where: {
      id: { in: topProductIds },
    },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });

  const productsInfoMap = new Map(
    topProductsInfo.map((p) => [p.id, p])
  );

  const topSellers = bestSellersGrouped.map((item) => {
    const productDetails = productsInfoMap.get(item.productId);
    const imageUrl = productDetails?.images[0]?.url || null;
    return {
      productId: item.productId,
      name: item.productName,
      quantitySold: item._sum.quantity ?? 0,
      imageUrl,
    };
  });

  // Fallback: If there are no order items yet, load 5 default products with 0 quantity sold
  if (topSellers.length === 0) {
    const defaultProducts = await prisma.product.findMany({
      take: 5,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });
    
    defaultProducts.forEach((p) => {
      topSellers.push({
        productId: p.id,
        name: p.name,
        quantitySold: 0,
        imageUrl: p.images[0]?.url || null,
      });
    });
  }

  return (
    <AdminDashboardClient
      stats={{
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalProducts,
      }}
      topSellers={topSellers}
    />
  );
}