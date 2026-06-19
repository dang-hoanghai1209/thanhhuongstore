-- Add optional product descriptions for admin-managed catalog content.
ALTER TABLE "Product"
ADD COLUMN "shortDescription" TEXT,
ADD COLUMN "description" TEXT;
