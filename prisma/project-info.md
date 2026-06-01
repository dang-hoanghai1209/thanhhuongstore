<!-- schema prisma -->
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// ENUMS (6)
// ==========================================

enum UserRole {
  CUSTOMER
  WHOLESALE
  ADMIN
}

enum WholesaleStatus {
  PENDING
  APPROVED
  REJECTED
}

enum SizeType {
  SOCK
  SWIMWEAR
  UNDERWEAR
  SHOE
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPING
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentMethod {
  COD
  VNPAY
  BANK_TRANSFER
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

// ==========================================
// MODELS (18)
// ==========================================

// USER & AUTH (5 Models)

model User {
  id               String            @id @default(uuid())
  email            String            @unique
  phone            String?
  passwordHash     String
  firstName        String
  lastName         String
  role             UserRole          @default(CUSTOMER)
  isActive         Boolean           @default(true)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  
  wholesaleProfile WholesaleProfile?
  refreshTokens    RefreshToken[]
  passwordResets   PasswordReset[]
  addresses        Address[]
  cart             Cart?
  wishlist         Wishlist?
  orders           Order[]
  reviews          Review[]
}

model WholesaleProfile {
  id          String          @id @default(uuid())
  userId      String          @unique
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName String
  taxCode     String
  status      WholesaleStatus @default(PENDING)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model PasswordReset {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
}

model Address {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName  String
  phone     String
  province  String
  district  String
  ward      String
  street    String
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
}

// CATALOG (4 Models)

model Category {
  id        String    @id @default(uuid())
  name      String
  slug      String    @unique
  sizeType  SizeType
  sortOrder Int       @default(0)
  parentId  String?
  parent    Category? @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children  Category[] @relation("CategoryHierarchy")
  isActive  Boolean   @default(true)
  products  Product[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Product {
  id             String           @id @default(uuid())
  name           String
  slug           String           @unique
  categoryId     String
  category       Category         @relation(fields: [categoryId], references: [id])
  sizeType       SizeType
  wholesaleTiers Json?            // format: [{"minQty": 10, "discount": 5}]
  isFeatured     Boolean          @default(false)
  isActive       Boolean          @default(true)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  
  variants       ProductVariant[]
  images         ProductImage[]
  reviews        Review[]
  wishlistItems  WishlistItem[]
}

model ProductVariant {
  id             String      @id @default(uuid())
  productId      String
  product        Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku            String      @unique
  size           String      // e.g., XS, S, M, L, XL, XXL
  color          String
  colorHex       String
  retailPrice    Decimal     @db.Decimal(12, 2)
  wholesalePrice Decimal     @db.Decimal(12, 2)
  stock          Int         @default(0)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  
  cartItems      CartItem[]
  orderItems     OrderItem[]
}

model ProductImage {
  id        String   @id @default(uuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  isPrimary Boolean  @default(false)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// COMMERCE (4 Models)

model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String         @id @default(uuid())
  cartId    String
  cart      Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  variantId String
  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  quantity  Int            @default(1)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  @@unique([cartId, variantId])
}

model Order {
  id              String        @id @default(uuid())
  orderNumber     String        @unique // ORD-YYYYMMDD-0001
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  addressId       String?
  address         Address?      @relation(fields: [addressId], references: [id], onDelete: SetNull)
  status          OrderStatus   @default(PENDING)
  paymentMethod   PaymentMethod @default(COD)
  paymentStatus   PaymentStatus @default(PENDING)
  shippingAddress Json          // Snapshot: {fullName, phone, province, district, ward, street}
  subtotal        Decimal       @db.Decimal(12, 2)
  discountAmount  Decimal       @db.Decimal(12, 2) @default(0)
  shippingFee     Decimal       @db.Decimal(12, 2) @default(0)
  totalAmount     Decimal       @db.Decimal(12, 2)
  couponCode      String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  items           OrderItem[]
}

model OrderItem {
  id          String          @id @default(uuid())
  orderId     String
  order       Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  variantId   String?
  variant     ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)
  quantity    Int
  unitPrice   Decimal         @db.Decimal(12, 2)
  productName String          // Snapshot of product name
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model Wishlist {
  id        String         @id @default(uuid())
  userId    String         @unique
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     WishlistItem[]
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
}

model WishlistItem {
  id         String   @id @default(uuid())
  wishlistId String
  wishlist   Wishlist @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([wishlistId, productId])
}

// CMS & BUSINESS (3 Models)

model Review {
  id         String   @id @default(uuid())
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  rating     Int      // 1-5
  comment    String?
  isVerified Boolean  @default(false)
  isApproved Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Banner {
  id        String    @id @default(uuid())
  title     String
  imageUrl  String
  linkUrl   String?
  sortOrder Int       @default(0)
  isActive  Boolean   @default(true)
  startsAt  DateTime?
  endsAt    DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Coupon {
  id             String    @id @default(uuid())
  code           String    @unique
  discountType   String    // 'percent' or 'fixed'
  discountValue  Decimal   @db.Decimal(12, 2)
  minOrderValue  Decimal   @db.Decimal(12, 2) @default(0)
  maxDiscount    Decimal?  @db.Decimal(12, 2)
  usageLimit     Int       @default(0)
  usedCount      Int       @default(0)
  startsAt       DateTime?
  endsAt         DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

### 1. TECH STACK (CÔNG NGHỆ SỬ DỤNG)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict mode)
- **Database ORM:** Prisma
- **Database Engine:** PostgreSQL
- **Styling:** Tailwind CSS
- **Icon:** Lucide React (hoặc Heroicons)

### 2. CORE RULES (QUY TẮC CỐT LÕI KHI CODE)

**A. Kiến trúc Next.js (App Router)**
- Toàn bộ giao diện (Frontend) phải nằm trong file `page.tsx` và dùng `export default function`.
- Toàn bộ API (Backend) phải nằm trong file `route.ts` và dùng `export async function GET/POST/PUT/DELETE`.
- Mặc định tất cả component là **Server Components**. Chỉ sử dụng chỉ thị `'use client'` ở dòng đầu tiên đối với các component cần tương tác (có chứa `useState`, `useEffect`, `onClick`...).

**B. Xử lý Dữ liệu & Database**
- Chỉ sử dụng Prisma Client để thao tác với Database. Tuyệt đối không viết raw SQL.
- Đối với Backend API (`route.ts`), dữ liệu trả về phải được bọc trong `NextResponse.json()`.
- Bắt buộc phải xử lý lỗi bằng `try/catch` trong mọi API, trả về HTTP status 500 nếu server có lỗi.

**C. Giao diện (Styling)**
- Chỉ sử dụng Tailwind CSS cho việc thiết kế UI. Không tự tạo file `.css` hoặc `.module.css` bên ngoài.
- Code giao diện ưu tiên tính Responsive (Mobile-first).

### 3. PHÂN CÔNG NHIỆM VỤ (TEAM COLLABORATION PROTOCOL)
Dự án này được phát triển song song bởi 2 AI Agents. Vui lòng tuân thủ tuyệt đối ranh giới công việc sau để tránh conflict code:

- **CODEX (Backend Lead):** 
  + Chỉ được phép thao tác trên các file: `route.ts` (API), `schema.prisma`, và các script liên quan đến Database/Server.
  + **Tuyệt đối KHÔNG** được chỉnh sửa, xóa hoặc ghi đè các file giao diện (`page.tsx`, `layout.tsx`, components).

- **ANTIGRAVITY (Frontend Lead):** 
  + Chỉ được phép thao tác trên các file giao diện: `page.tsx`, `layout.tsx`, components và CSS/Tailwind.
  + **Tuyệt đối KHÔNG** được chỉnh sửa, xóa hoặc ghi đè cấu trúc Database (`schema.prisma`) hay logic API (`route.ts`).

- **Giao tiếp chung:** Hai bên làm việc độc lập. Backend sẽ cung cấp cấu trúc JSON (Mock Data Contract), Frontend sẽ dựa vào JSON đó để thiết kế UI.