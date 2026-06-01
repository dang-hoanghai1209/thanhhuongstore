import prisma from '@/lib/prisma';
import BannersClient from './BannersClient';

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: {
      sortOrder: 'asc',
    },
  });

  return <BannersClient initialBanners={banners} />;
}
