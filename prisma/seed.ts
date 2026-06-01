import { PrismaClient, SizeType } from '../node_modules/.prisma/seed-client';

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
  sizes?: string[];
  retailPrice?: number;
  wholesalePrice?: number;
  colors: VariantSeed[];
};

const products: ProductSeed[] = [
  {
    name: 'Găng tay cotton trơn đa năng',
    slug: 'gang-tay-cotton-tron-da-nang',
    categorySlug: 'phu-kien-chong-nang',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 15000,
    wholesalePrice: 10000,
    colors: [
      { color: 'Tím', colorHex: '#7E22CE' },
      { color: 'Xám', colorHex: '#6B7280' },
      { color: 'Xanh dương', colorHex: '#2563EB' },
      { color: 'Đen', colorHex: '#111827' },
    ],
  },
  {
    name: 'Găng tay sợi cotton bảo hộ dày dặn',
    slug: 'gang-tay-soi-cotton-bao-ho-day-dan',
    categorySlug: 'bao-ho-lao-dong',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 5000,
    wholesalePrice: 3500,
    colors: [{ color: 'Trắng mộc', colorHex: '#F5F5DC' }],
  },
  {
    name: 'Găng tay sợi bảo hộ dệt sọc',
    slug: 'gang-tay-soi-bao-ho-det-soc',
    categorySlug: 'bao-ho-lao-dong',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 6000,
    wholesalePrice: 4000,
    colors: [{ color: 'Tiêu xám', colorHex: '#737373' }],
  },
  {
    name: 'Găng tay len dệt kim kẻ sọc',
    slug: 'gang-tay-len-det-kim-ke-soc',
    categorySlug: 'gang-tay-mua-dong',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 35000,
    colors: [
      { color: 'Đỏ', colorHex: '#DC2626' },
      { color: 'Navy', colorHex: '#1E3A8A' },
      { color: 'Đen', colorHex: '#111827' },
      { color: 'Rêu', colorHex: '#4D7C0F' },
      { color: 'Hồng', colorHex: '#F472B6' },
    ],
  },
  {
    name: 'Găng tay thun tăm mỏng chống nắng',
    slug: 'gang-tay-thun-tam-mong-chong-nang',
    categorySlug: 'phu-kien-chong-nang',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 25000,
    colors: [
      { color: 'Nâu', colorHex: '#92400E' },
      { color: 'Navy', colorHex: '#1E3A8A' },
      { color: 'Xanh cổ vịt', colorHex: '#0F766E' },
      { color: 'Tím khói', colorHex: '#A78BFA' },
    ],
  },
  {
    name: 'Găng tay len gân vintage',
    slug: 'gang-tay-len-gan-vintage',
    categorySlug: 'gang-tay-mua-dong',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 40000,
    colors: [
      { color: 'Vàng mustard', colorHex: '#D97706' },
      { color: 'Xanh ngọc', colorHex: '#14B8A6' },
      { color: 'Nâu', colorHex: '#92400E' },
    ],
  },
  {
    name: 'Găng tay len lật ngón bông tuyết',
    slug: 'gang-tay-len-lat-ngon-bong-tuyet',
    categorySlug: 'gang-tay-mua-dong',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 45000,
    colors: [
      { color: 'Hồng', colorHex: '#F472B6' },
      { color: 'Xanh mint', colorHex: '#99F6E4' },
      { color: 'Đỏ', colorHex: '#DC2626' },
    ],
  },
  {
    name: 'Găng tay len dệt kim Han Tao',
    slug: 'gang-tay-len-det-kim-han-tao',
    categorySlug: 'gang-tay-mua-dong',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 50000,
    colors: [
      { color: 'Xanh rêu', colorHex: '#4D7C0F' },
      { color: 'Đỏ đô', colorHex: '#991B1B' },
      { color: 'Navy', colorHex: '#1E3A8A' },
    ],
  },
  {
    name: 'Ống tay chống nắng làm mát xỏ ngón',
    slug: 'ong-tay-chong-nang-lam-mat-xo-ngon',
    categorySlug: 'phu-kien-chong-nang',
    sizeType: SizeType.ACCESSORY,
    retailPrice: 20000,
    colors: [
      { color: 'Đen', colorHex: '#111827' },
      { color: 'Xám', colorHex: '#6B7280' },
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'Navy', colorHex: '#1E3A8A' },
    ],
  },
  {
    name: 'Tất xỏ ngón ren hoa Hao Li',
    slug: 'tat-xo-ngon-ren-hoa-hao-li',
    categorySlug: 'tat-vo-nu',
    sizeType: SizeType.SOCK,
    retailPrice: 15000,
    colors: [{ color: 'Da', colorHex: '#E7C6A5' }],
  },
  {
    name: 'Tất xỏ ngón A Nam dệt nổi',
    slug: 'tat-xo-ngon-a-nam-det-noi',
    categorySlug: 'tat-vo-nu',
    sizeType: SizeType.SOCK,
    colors: [{ color: 'Da', colorHex: '#E7C6A5' }],
  },
  {
    name: 'Tất xỏ ngón T&T Socks 2030',
    slug: 'tat-xo-ngon-t-t-socks-2030',
    categorySlug: 'tat-vo-nu',
    sizeType: SizeType.SOCK,
    colors: [{ color: 'Da', colorHex: '#E7C6A5' }],
  },
  {
    name: 'Quần lót lụa băng tàng hình Kanaqi 2205',
    slug: 'quan-lot-lua-bang-tang-hinh-kanaqi-2205',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    size: 'Freesize (45-60kg)',
    colors: [
      { color: 'Hồng', colorHex: '#F472B6' },
      { color: 'Cam đào', colorHex: '#FDBA74' },
      { color: 'Xanh ngọc', colorHex: '#14B8A6' },
      { color: 'Xanh nhạt', colorHex: '#BAE6FD' },
      { color: 'Be', colorHex: '#E8D5C4' },
      { color: 'Tím', colorHex: '#7E22CE' },
    ],
  },
  {
    name: 'Quần lót cotton thể thao cạp Tommy 2748',
    slug: 'quan-lot-cotton-the-thao-cap-tommy-2748',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    colors: [
      { color: 'Xanh lá', colorHex: '#16A34A' },
      { color: 'Trắng', colorHex: '#FFFFFF' },
      { color: 'Hồng', colorHex: '#F472B6' },
      { color: 'Đỏ', colorHex: '#DC2626' },
      { color: 'Đen', colorHex: '#111827' },
      { color: 'Xanh biển', colorHex: '#2563EB' },
      { color: 'Vàng', colorHex: '#EAB308' },
      { color: 'Cam', colorHex: '#F97316' },
      { color: 'Tím', colorHex: '#7E22CE' },
    ],
  },
  {
    name: 'Quần lót cotton viền sóng Qiaoniman 8865',
    slug: 'quan-lot-cotton-vien-song-qiaoniman-8865',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    colors: [
      { color: 'Xanh ngọc', colorHex: '#14B8A6' },
      { color: 'Hồng nhạt', colorHex: '#FBCFE8' },
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'Trắng', colorHex: '#FFFFFF' },
      { color: 'Vàng', colorHex: '#EAB308' },
      { color: 'Hồng đậm', colorHex: '#DB2777' },
    ],
  },
  {
    name: 'Quần lót lụa mềm mượt Xueqiaoer 939',
    slug: 'quan-lot-lua-mem-muot-xueqiaoer-939',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    colors: [
      { color: 'Hồng sen', colorHex: '#EC4899' },
      { color: 'Xanh cổ vịt', colorHex: '#0F766E' },
      { color: 'Trắng', colorHex: '#FFFFFF' },
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'Cam đào', colorHex: '#FDBA74' },
      { color: 'Tím', colorHex: '#7E22CE' },
      { color: 'Xanh nhạt', colorHex: '#BAE6FD' },
    ],
  },
  {
    name: 'Quần lót cotton phối viền ren hông 883',
    slug: 'quan-lot-cotton-phoi-vien-ren-hong-883',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    colors: [
      { color: 'Xanh dương', colorHex: '#2563EB' },
      { color: 'Trắng', colorHex: '#FFFFFF' },
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'Hồng nhạt', colorHex: '#FBCFE8' },
    ],
  },
  {
    name: 'Quần lót cotton viền ren cạp cao 239',
    slug: 'quan-lot-cotton-vien-ren-cap-cao-239',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    colors: [
      { color: 'Hồng', colorHex: '#F472B6' },
      { color: 'Xanh dương', colorHex: '#2563EB' },
      { color: 'Vàng', colorHex: '#EAB308' },
      { color: 'Xanh lá', colorHex: '#16A34A' },
      { color: 'Trắng', colorHex: '#FFFFFF' },
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'Hồng đậm', colorHex: '#DB2777' },
    ],
  },
  {
    name: 'Quần lót phối viền ren đùi KaanQi 518',
    slug: 'quan-lot-phoi-vien-ren-dui-kaanqi-518',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    colors: [
      { color: 'Trắng', colorHex: '#FFFFFF' },
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'Vàng', colorHex: '#EAB308' },
      { color: 'Xanh nhạt', colorHex: '#BAE6FD' },
      { color: 'Xanh lá', colorHex: '#16A34A' },
      { color: 'Tím mận', colorHex: '#86198F' },
    ],
  },
  {
    name: 'Quần lót vải Modal kháng khuẩn 802',
    slug: 'quan-lot-vai-modal-khang-khuan-802',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    colors: [
      { color: 'Vàng nhạt', colorHex: '#FEF08A' },
      { color: 'Xanh biển', colorHex: '#2563EB' },
      { color: 'Đỏ', colorHex: '#DC2626' },
      { color: 'Đen', colorHex: '#111827' },
      { color: 'Trắng', colorHex: '#FFFFFF' },
      { color: 'Hồng', colorHex: '#F472B6' },
      { color: 'Xanh cổ vịt', colorHex: '#0F766E' },
      { color: 'Tím', colorHex: '#7E22CE' },
    ],
  },
  {
    name: 'Áo lót ren đệm mỏng nâng ngực 3256',
    slug: 'ao-lot-ren-dem-mong-nang-nguc-3256',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    sizes: ['36', '38', '40'],
    colors: [
      { color: 'Đen', colorHex: '#111827' },
      { color: 'Đỏ mận', colorHex: '#9F1239' },
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'Vàng', colorHex: '#EAB308' },
    ],
  },
  {
    name: 'Áo lót trơn đúc su Hương Mộc Lan A01',
    slug: 'ao-lot-tron-duc-su-huong-moc-lan-a01',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    sizes: ['34', '36', '38', '40', '42'],
    colors: [
      { color: 'Đen', colorHex: '#111827' },
      { color: 'Xám', colorHex: '#6B7280' },
      { color: 'Xanh dương', colorHex: '#2563EB' },
      { color: 'Nâu', colorHex: '#92400E' },
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'Kem', colorHex: '#FFFDD0' },
    ],
  },
  {
    name: 'Quần lót cotton dệt họa tiết chìm 88639',
    slug: 'quan-lot-cotton-det-hoa-tiet-chim-88639',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    colors: [
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'Trắng', colorHex: '#FFFFFF' },
      { color: 'Xanh nhạt', colorHex: '#BAE6FD' },
      { color: 'Hồng', colorHex: '#F472B6' },
      { color: 'Vàng nhạt', colorHex: '#FEF08A' },
    ],
  },
  {
    name: 'Quần lót lụa thêu hoa Bigsize 365',
    slug: 'quan-lot-lua-theu-hoa-bigsize-365',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    size: 'Bigsize 60-78kg',
    colors: [
      { color: 'Hồng đậm', colorHex: '#DB2777' },
      { color: 'Cam đào', colorHex: '#FDBA74' },
      { color: 'Vàng', colorHex: '#EAB308' },
      { color: 'Hồng nhạt', colorHex: '#FBCFE8' },
      { color: 'Da', colorHex: '#E7C6A5' },
      { color: 'Trắng', colorHex: '#FFFFFF' },
      { color: 'Xanh ngọc', colorHex: '#14B8A6' },
    ],
  },
  {
    name: 'Quần lót gen nịt bụng cạp cao Spring 8803',
    slug: 'quan-lot-gen-nit-bung-cap-cao-spring-8803',
    categorySlug: 'do-lot-cao-cap',
    sizeType: SizeType.UNDERWEAR,
    colors: [
      { color: 'Đen', colorHex: '#111827' },
      { color: 'Da', colorHex: '#E7C6A5' },
    ],
  },
];

async function clearDatabase() {
  await prisma.$transaction([
    prisma.verificationToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.passwordReset.deleteMany(),
    prisma.refreshToken.deleteMany(),
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

function createSku(slug: string, colorIndex: number, sizeIndex: number) {
  const colorCode = String(colorIndex + 1).padStart(2, '0');
  const sizeCode = String(sizeIndex + 1).padStart(2, '0');

  return `${slug.toUpperCase()}-${colorCode}-${sizeCode}`;
}

function createRetailPrice(slug: string) {
  const checksum = [...slug].reduce((total, character) => {
    return total + character.charCodeAt(0);
  }, 0);

  return 20000 + (checksum % 7) * 5000;
}

async function main() {
  console.log('Clearing existing data...');
  await clearDatabase();

  console.log('Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Phụ kiện chống nắng',
        slug: 'phu-kien-chong-nang',
        sizeType: SizeType.ACCESSORY,
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bảo hộ lao động',
        slug: 'bao-ho-lao-dong',
        sizeType: SizeType.ACCESSORY,
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Găng tay mùa đông',
        slug: 'gang-tay-mua-dong',
        sizeType: SizeType.ACCESSORY,
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tất vớ nữ',
        slug: 'tat-vo-nu',
        sizeType: SizeType.SOCK,
        sortOrder: 4,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Đồ lót cao cấp',
        slug: 'do-lot-cao-cap',
        sizeType: SizeType.UNDERWEAR,
        sortOrder: 5,
        isActive: true,
      },
    }),
  ]);

  const categoryIds = new Map(
    categories.map((category) => [category.slug, category.id]),
  );

  console.log('Creating products...');
  for (const product of products) {
    const categoryId = categoryIds.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Category not found: ${product.categorySlug}`);
    }

    const retailPrice = product.retailPrice ?? createRetailPrice(product.slug);
    const wholesalePrice = product.wholesalePrice ?? retailPrice;
    const sizes = product.sizes ?? [product.size ?? 'Freesize'];

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        categoryId,
        sizeType: product.sizeType,
        isActive: true,
        images: {
          create: {
            url: `https://picsum.photos/seed/${product.slug}/1200/1200`,
            isPrimary: true,
            sortOrder: 0,
          },
        },
        variants: {
          create: product.colors.flatMap((variant, colorIndex) =>
            sizes.map((size, sizeIndex) => ({
              sku: createSku(product.slug, colorIndex, sizeIndex),
              size,
              color: variant.color,
              colorHex: variant.colorHex,
              retailPrice,
              wholesalePrice,
              stock: 100,
            })),
          ),
        },
      },
    });
  }

  console.log('Seed completed: 5 categories and 25 products created.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
