UPDATE "Category"
SET
  "name" = 'Sản phẩm nhiều mẫu',
  "slug" = 'san-pham-nhieu-mau',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'hang-nhieu-mau-gia-si';

UPDATE "Product"
SET
  "name" = 'Tất nhiều mẫu',
  "slug" = 'tat-nhieu-mau',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'tat-nhieu-mau-gia-si';

UPDATE "Product"
SET
  "name" = 'Mẫu tất vớ nhiều màu',
  "slug" = 'mau-tat-vo-nhieu-mau',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'mau-tat-vo-ban-si-nhieu-mau';
