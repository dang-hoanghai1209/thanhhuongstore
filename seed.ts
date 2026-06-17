import { PrismaClient, SizeType } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Vo thoi trang',
    slug: 'vo-thoi-trang',
    sizeType: SizeType.SOCK,
    sortOrder: 1,
  },
  {
    name: 'Do boi',
    slug: 'do-boi',
    sizeType: SizeType.SWIMWEAR,
    sortOrder: 2,
  },
];

const products = [
  {
    name: 'Vo co ngan Cotton Premium',
    slug: 'vo-co-ngan-cotton-premium',
    categorySlug: 'vo-thoi-trang',
    sizeType: SizeType.SOCK,
    isFeatured: true,
    wholesaleTiers: [
      { minQty: 10, discount: 5 },
      { minQty: 30, discount: 10 },
    ],
    variants: [
      {
        sku: 'SOCK-COTTON-WHITE-FREE',
        size: 'FREE',
        color: 'Trang',
        colorHex: '#FFFFFF',
        retailPrice: 59000,
        wholesalePrice: 49000,
        stock: 120,
      },
      {
        sku: 'SOCK-COTTON-BLACK-FREE',
        size: 'FREE',
        color: 'Den',
        colorHex: '#000000',
        retailPrice: 59000,
        wholesalePrice: 49000,
        stock: 100,
      },
    ],
    images: [
      {
        url: '/uploads/products/tat-da-min.jpg',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
  },
  {
    name: 'Vo co cao Basic',
    slug: 'vo-co-cao-basic',
    categorySlug: 'vo-thoi-trang',
    sizeType: SizeType.SOCK,
    isFeatured: false,
    wholesaleTiers: [{ minQty: 10, discount: 5 }],
    variants: [
      {
        sku: 'SOCK-BASIC-GRAY-FREE',
        size: 'FREE',
        color: 'Xam',
        colorHex: '#808080',
        retailPrice: 69000,
        wholesalePrice: 55000,
        stock: 80,
      },
    ],
    images: [
      {
        url: '/uploads/products/tat-tron-min-mausang.jpg',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
  },
  {
    name: 'Ao boi nu Ocean',
    slug: 'ao-boi-nu-ocean',
    categorySlug: 'do-boi',
    sizeType: SizeType.SWIMWEAR,
    isFeatured: true,
    wholesaleTiers: [
      { minQty: 5, discount: 5 },
      { minQty: 20, discount: 12 },
    ],
    variants: [
      {
        sku: 'SWIM-OCEAN-BLUE-M',
        size: 'M',
        color: 'Xanh bien',
        colorHex: '#0077BE',
        retailPrice: 499000,
        wholesalePrice: 429000,
        stock: 35,
      },
      {
        sku: 'SWIM-OCEAN-BLUE-L',
        size: 'L',
        color: 'Xanh bien',
        colorHex: '#0077BE',
        retailPrice: 499000,
        wholesalePrice: 429000,
        stock: 28,
      },
    ],
    images: [
      {
        url: '/uploads/products/tat-bong-999.jpg',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
  },
  {
    name: 'Quan boi nam Active',
    slug: 'quan-boi-nam-active',
    categorySlug: 'do-boi',
    sizeType: SizeType.SWIMWEAR,
    isFeatured: false,
    wholesaleTiers: [{ minQty: 10, discount: 8 }],
    variants: [
      {
        sku: 'SWIM-ACTIVE-BLACK-L',
        size: 'L',
        color: 'Den',
        colorHex: '#000000',
        retailPrice: 299000,
        wholesalePrice: 249000,
        stock: 45,
      },
      {
        sku: 'SWIM-ACTIVE-BLACK-XL',
        size: 'XL',
        color: 'Den',
        colorHex: '#000000',
        retailPrice: 299000,
        wholesalePrice: 249000,
        stock: 32,
      },
    ],
    images: [
      {
        url: '/uploads/products/bao-tay-lao-dong-den-xam.jpg',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
  },
];

async function main() {
  const categoryIds = new Map<string, string>();

  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });

    categoryIds.set(category.slug, savedCategory.id);
  }

  for (const { categorySlug, variants, images, ...productData } of products) {
    const categoryId = categoryIds.get(categorySlug);

    if (!categoryId) {
      throw new Error(`Category not found: ${categorySlug}`);
    }

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        ...productData,
        categoryId,
        isActive: true,
      },
      create: {
        ...productData,
        categoryId,
        isActive: true,
      },
    });

    for (const variant of variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {
          ...variant,
          productId: product.id,
        },
        create: {
          ...variant,
          productId: product.id,
        },
      });
    }

    for (const image of images) {
      const existingImage = await prisma.productImage.findFirst({
        where: {
          productId: product.id,
          url: image.url,
        },
      });

      if (existingImage) {
        await prisma.productImage.update({
          where: { id: existingImage.id },
          data: image,
        });
      } else {
        await prisma.productImage.create({
          data: {
            ...image,
            productId: product.id,
          },
        });
      }
    }
  }

  console.log('Seed completed: 2 categories and 4 products are ready.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
