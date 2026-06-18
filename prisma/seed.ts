import bcrypt from 'bcrypt';
import { PrismaClient, SizeType, UserRole } from '@prisma/client';

const directDatabaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!directDatabaseUrl) {
  throw new Error('DIRECT_URL or DATABASE_URL must be configured before seeding.');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directDatabaseUrl,
    },
  },
});

type VariantSeed = {
  color: string;
  colorHex: string;
};

type ProductSeed = {
  name: string;
  slug: string;
  categorySlug: string;
  sizeType: SizeType;
  size?: string;
  retailPrice: number;
  wholesalePrice: number;
  colors: VariantSeed[];
  images: string[];
  isFeatured?: boolean;
};

const PRODUCT_IMAGE_BASE = '/uploads/products';

const categories = [
  {
    name: 'Bao tay lao Ä‘á»™ng',
    slug: 'bao-tay-lao-dong',
    sizeType: SizeType.ACCESSORY,
    sortOrder: 1,
  },
  {
    name: 'Táº¥t nam',
    slug: 'tat-nam',
    sizeType: SizeType.SOCK,
    sortOrder: 2,
  },
  {
    name: 'Táº¥t bÃ´ng / táº¥t dÃ y',
    slug: 'tat-bong-tat-day',
    sizeType: SizeType.SOCK,
    sortOrder: 3,
  },
  {
    name: 'Táº¥t / Vá»›',
    slug: 'tat-vo',
    sizeType: SizeType.SOCK,
    sortOrder: 4,
  },
  {
    name: 'Sản phẩm nhiều mẫu',
    slug: 'san-pham-nhieu-mau',
    sizeType: SizeType.SOCK,
    sortOrder: 5,
  },
];

const products: ProductSeed[] = [
  {
    name: 'Bao tay lao Ä‘á»™ng Ä‘en xÃ¡m',
    slug: 'bao-tay-lao-dong-den-xam',
    categorySlug: 'bao-tay-lao-dong',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 6000,
    wholesalePrice: 4000,
    colors: [{ color: 'Äen xÃ¡m', colorHex: '#4B5563' }],
    images: [`${PRODUCT_IMAGE_BASE}/bao-tay-lao-dong-den-xam.jpg`],
    isFeatured: true,
  },
  {
    name: 'Bao tay lao Ä‘á»™ng Ä‘en',
    slug: 'bao-tay-lao-dong-den',
    categorySlug: 'bao-tay-lao-dong',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 6000,
    wholesalePrice: 4000,
    colors: [{ color: 'Äen', colorHex: '#111827' }],
    images: [`${PRODUCT_IMAGE_BASE}/bao-tay-lao-dong-den.jpg`],
  },
  {
    name: 'Bao tay lao Ä‘á»™ng tráº¯ng',
    slug: 'bao-tay-lao-dong-trang',
    categorySlug: 'bao-tay-lao-dong',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 5000,
    wholesalePrice: 3500,
    colors: [{ color: 'Tráº¯ng', colorHex: '#F8FAFC' }],
    images: [`${PRODUCT_IMAGE_BASE}/bao-tay-lao-dong-trang.jpg`],
  },
  {
    name: 'Táº¥t nam 5 Ä‘Ã´i cÃ³ bao bÃ¬',
    slug: 'tat-nam-5-doi-co-bao-bi',
    categorySlug: 'tat-nam',
    sizeType: SizeType.SOCK,
    retailPrice: 35000,
    wholesalePrice: 28000,
    colors: [
      { color: 'Nhiá»u mÃ u', colorHex: '#64748B' },
      { color: 'SÃ¡ng mÃ u', colorHex: '#E5E7EB' },
      { color: 'Tá»‘i mÃ u', colorHex: '#1F2937' },
    ],
    images: [
      `${PRODUCT_IMAGE_BASE}/tat-nam-5-bo-bao-bi.jpg`,
      `${PRODUCT_IMAGE_BASE}/tat-nam-5-bo-baobi.jpg`,
      `${PRODUCT_IMAGE_BASE}/tat-nam-5doi-le.jpg`,
    ],
    isFeatured: true,
  },
  {
    name: 'Táº¥t A Nam',
    slug: 'tat-a-nam',
    categorySlug: 'tat-nam',
    sizeType: SizeType.SOCK,
    retailPrice: 12000,
    wholesalePrice: 9000,
    colors: [{ color: 'Da', colorHex: '#E7C6A5' }],
    images: [`${PRODUCT_IMAGE_BASE}/tat-a-nam.jpg`],
  },
  {
    name: 'Táº¥t bÃ´ng 999',
    slug: 'tat-bong-999',
    categorySlug: 'tat-bong-tat-day',
    sizeType: SizeType.SOCK,
    retailPrice: 18000,
    wholesalePrice: 14000,
    colors: [
      { color: 'Nhiá»u mÃ u', colorHex: '#64748B' },
      { color: 'SÃ¡ng mÃ u', colorHex: '#E5E7EB' },
      { color: 'Tá»‘i mÃ u', colorHex: '#1F2937' },
    ],
    images: [
      `${PRODUCT_IMAGE_BASE}/tat-bong-999.jpg`,
      `${PRODUCT_IMAGE_BASE}/tat-bong-999-cac-mau.jpg`,
      `${PRODUCT_IMAGE_BASE}/tat-bong-999-toi.jpg`,
    ],
    isFeatured: true,
  },
  {
    name: 'Táº¥t xÃ¹ bÃ´ng',
    slug: 'tat-xu-bong',
    categorySlug: 'tat-bong-tat-day',
    sizeType: SizeType.SOCK,
    retailPrice: 20000,
    wholesalePrice: 16000,
    colors: [
      { color: 'SÃ¡ng mÃ u', colorHex: '#E5E7EB' },
      { color: 'Tá»‘i mÃ u', colorHex: '#1F2937' },
    ],
    images: [
      `${PRODUCT_IMAGE_BASE}/tat-xu-bong-sang.jpg`,
      `${PRODUCT_IMAGE_BASE}/tat-xu-bong-toi.jpg`,
    ],
  },
  {
    name: 'Táº¥t da má»‹n',
    slug: 'tat-da-min',
    categorySlug: 'tat-vo',
    sizeType: SizeType.SOCK,
    retailPrice: 15000,
    wholesalePrice: 11000,
    colors: [
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'Nhiá»u mÃ u', colorHex: '#64748B' },
    ],
    images: [
      `${PRODUCT_IMAGE_BASE}/tat-da-min.jpg`,
      `${PRODUCT_IMAGE_BASE}/tat-da-min-cac-mau.jpg`,
    ],
  },
  {
    name: 'Táº¥t Háº£o Li',
    slug: 'tat-hao-li',
    categorySlug: 'tat-vo',
    sizeType: SizeType.SOCK,
    retailPrice: 15000,
    wholesalePrice: 11000,
    colors: [{ color: 'Da', colorHex: '#E7C6A5' }],
    images: [`${PRODUCT_IMAGE_BASE}/tat-hao-li.jpg`],
  },
  {
    name: 'Táº¥t T&T',
    slug: 'tat-t-and-t',
    categorySlug: 'tat-vo',
    sizeType: SizeType.SOCK,
    retailPrice: 15000,
    wholesalePrice: 11000,
    colors: [
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'SÃ¡ng mÃ u', colorHex: '#E5E7EB' },
    ],
    images: [
      `${PRODUCT_IMAGE_BASE}/tat-t-and-t.jpg`,
      `${PRODUCT_IMAGE_BASE}/tat-t-and-t-508.jpg`,
    ],
  },
  {
    name: 'Táº¥t trÆ¡n má»‹n mÃ u sÃ¡ng',
    slug: 'tat-tron-min-mau-sang',
    categorySlug: 'tat-vo',
    sizeType: SizeType.SOCK,
    retailPrice: 13000,
    wholesalePrice: 10000,
    colors: [{ color: 'SÃ¡ng mÃ u', colorHex: '#E5E7EB' }],
    images: [`${PRODUCT_IMAGE_BASE}/tat-tron-min-mausang.jpg`],
  },
  {
    name: 'Tất nhiều mẫu',
    slug: 'tat-nhieu-mau',
    categorySlug: 'san-pham-nhieu-mau',
    sizeType: SizeType.SOCK,
    retailPrice: 18000,
    wholesalePrice: 13000,
    colors: [
      { color: 'Nhiá»u mÃ u', colorHex: '#64748B' },
      { color: 'SÃ¡ng mÃ u', colorHex: '#E5E7EB' },
      { color: 'Tá»‘i mÃ u', colorHex: '#1F2937' },
    ],
    images: [
      `${PRODUCT_IMAGE_BASE}/mau-2205.jpg`,
      `${PRODUCT_IMAGE_BASE}/mau-239.jpg`,
      `${PRODUCT_IMAGE_BASE}/mau-2748.jpg`,
      `${PRODUCT_IMAGE_BASE}/mau-365.jpg`,
      `${PRODUCT_IMAGE_BASE}/mau-518.jpg`,
    ],
  },
  {
    name: 'Mẫu tất vớ nhiều màu',
    slug: 'mau-tat-vo-nhieu-mau',
    categorySlug: 'san-pham-nhieu-mau',
    sizeType: SizeType.SOCK,
    retailPrice: 18000,
    wholesalePrice: 13000,
    colors: [
      { color: 'Nhiá»u mÃ u', colorHex: '#64748B' },
      { color: 'Phá»‘i mÃ u', colorHex: '#A855F7' },
    ],
    images: [
      `${PRODUCT_IMAGE_BASE}/mau-802.jpg`,
      `${PRODUCT_IMAGE_BASE}/mau-8803.jpg`,
      `${PRODUCT_IMAGE_BASE}/mau-883.jpg`,
      `${PRODUCT_IMAGE_BASE}/mau-88639.jpg`,
      `${PRODUCT_IMAGE_BASE}/mau-88651.jpg`,
    ],
  },
  {
    name: 'Táº¥t vá»› nhiá»u mÃ u tÃ¹y lÃ´ hÃ ng',
    slug: 'tat-vo-nhieu-mau-tuy-lo-hang',
    categorySlug: 'san-pham-nhieu-mau',
    sizeType: SizeType.SOCK,
    retailPrice: 18000,
    wholesalePrice: 13000,
    colors: [
      { color: 'Nhiá»u mÃ u', colorHex: '#64748B' },
      { color: 'TÃ¹y lÃ´ hÃ ng', colorHex: '#0F766E' },
    ],
    images: [
      `${PRODUCT_IMAGE_BASE}/mau-939.jpg`,
      `${PRODUCT_IMAGE_BASE}/mau-a01.jpg`,
      `${PRODUCT_IMAGE_BASE}/mau-a02.jpg`,
    ],
  },
];

async function clearDatabase() {
  await prisma.$transaction([
    prisma.passwordReset.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.oAuthAccount.deleteMany(),
    prisma.wholesaleProfile.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.review.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.address.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.banner.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Skipping admin seed because SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD is missing.');
    return;
  }

  const firstName = process.env.SEED_ADMIN_FIRST_NAME?.trim() || 'Admin';
  const lastName = process.env.SEED_ADMIN_LAST_NAME?.trim() || 'User';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log(`Admin seed completed for ${email}.`);
}

function createSku(slug: string, colorIndex: number) {
  const colorCode = String(colorIndex + 1).padStart(2, '0');
  return `${slug.toUpperCase()}-${colorCode}-01`;
}

async function main() {
  console.log('Clearing existing data...');
  await clearDatabase();

  await seedAdminUser();

  console.log('Creating categories...');
  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.create({
        data: {
          ...category,
          isActive: true,
        },
      }),
    ),
  );

  const categoryIds = new Map(
    createdCategories.map((category) => [category.slug, category.id]),
  );

  console.log('Creating products with local product images...');
  for (const product of products) {
    const categoryId = categoryIds.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Category not found: ${product.categorySlug}`);
    }

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        categoryId,
        sizeType: product.sizeType,
        isActive: true,
        isFeatured: product.isFeatured ?? false,
        wholesaleTiers: [
          { minQty: 10, discount: 5 },
          { minQty: 30, discount: 10 },
        ],
        images: {
          create: product.images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
        variants: {
          create: product.colors.map((variant, colorIndex) => ({
            sku: createSku(product.slug, colorIndex),
            size: product.size ?? 'Freesize',
            color: variant.color,
            colorHex: variant.colorHex,
            retailPrice: product.retailPrice,
            wholesalePrice: product.wholesalePrice,
            stock: 100,
          })),
        },
      },
    });
  }

  console.log(`Seed completed: ${categories.length} categories and ${products.length} products created.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
