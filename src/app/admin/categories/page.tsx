import prisma from '@/lib/prisma';
import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      parent: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { parentId: 'asc' },
      { sortOrder: 'asc' },
    ],
  });

  return <CategoriesClient initialCategories={categories} />;
}
