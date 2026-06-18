-- Fix Category names
UPDATE "Category" SET name = 'Bao tay lao động' WHERE slug = 'bao-tay-lao-dong';
UPDATE "Category" SET name = 'Tất nam' WHERE slug = 'tat-nam';
UPDATE "Category" SET name = 'Tất bông / tất dày' WHERE slug = 'tat-bong-tat-day';
UPDATE "Category" SET name = 'Tất / Vớ' WHERE slug = 'tat-vo';

-- Fix Product names
UPDATE "Product" SET name = 'Bao tay lao động đen xám' WHERE slug = 'bao-tay-lao-dong-den-xam';
UPDATE "Product" SET name = 'Bao tay lao động đen' WHERE slug = 'bao-tay-lao-dong-den';
UPDATE "Product" SET name = 'Bao tay lao động trắng' WHERE slug = 'bao-tay-lao-dong-trang';
UPDATE "Product" SET name = 'Tất nam 5 đôi có bao bì' WHERE slug = 'tat-nam-5-doi-co-bao-bi';
UPDATE "Product" SET name = 'Tất A Nam' WHERE slug = 'tat-a-nam';
UPDATE "Product" SET name = 'Tất bông 999' WHERE slug = 'tat-bong-999';
UPDATE "Product" SET name = 'Tất xù bông' WHERE slug = 'tat-xu-bong';
UPDATE "Product" SET name = 'Tất da mịn' WHERE slug = 'tat-da-min';
UPDATE "Product" SET name = 'Tất Hảo Li' WHERE slug = 'tat-hao-li';
UPDATE "Product" SET name = 'Tất T&T' WHERE slug = 'tat-t-and-t';
UPDATE "Product" SET name = 'Tất trơn mịn màu sáng' WHERE slug = 'tat-tron-min-mau-sang';
UPDATE "Product" SET name = 'Tất vớ nhiều màu tùy lô hàng' WHERE slug = 'tat-vo-nhieu-mau-tuy-lo-hang';

-- Fix ProductVariant color names
UPDATE "ProductVariant" SET color = 'Đen xám' WHERE color = 'Ä en xÃ¡m';
UPDATE "ProductVariant" SET color = 'Đen' WHERE color = 'Ä en';
UPDATE "ProductVariant" SET color = 'Trắng' WHERE color = 'Tráº¯ng';
UPDATE "ProductVariant" SET color = 'Nhiều màu' WHERE color = 'Nhiá» u mÃ u';
UPDATE "ProductVariant" SET color = 'Sáng màu' WHERE color = 'SÃ¡ng mÃ u';
UPDATE "ProductVariant" SET color = 'Tối màu' WHERE color = 'Tá»‘i mÃ u';
UPDATE "ProductVariant" SET color = 'Phối màu' WHERE color = 'Phá»‘i mÃ u';
UPDATE "ProductVariant" SET color = 'Tùy lô hàng' WHERE color = 'TÃ¹y lÃ´ hÃ ng';
