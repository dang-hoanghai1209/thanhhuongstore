QUY ĐỊNH PHỐI HỢP GIỮA CODEX VÀ ANTIGRAVITY CHO PROJECT `thanhhuongstore`

Deadline deploy trong hôm nay. Cả hai AI được phép tự động chỉnh sửa code, nhưng phải tuân thủ phân công để tránh xung đột.

Mục tiêu chung:
Hoàn thiện full-stack website bán hàng Thanh Hương Store ở mức deploy được:

* Navbar click được hết
* Search sản phẩm hoạt động
* Filter minPrice/maxPrice/sort hoạt động
* Breadcrumb đầy đủ
* Category page hoạt động
* Product detail hoạt động
* Cart hoạt động
* Checkout tạo đơn được
* Account cơ bản hoạt động
* Admin dashboard/products/categories/orders/users cơ bản hoạt động
* Không crash
* Không 404 ngoài ý muốn
* `npm run lint` và `npm run build` pass nếu môi trường cho phép

PHÂN CÔNG:

CODEX phụ trách chính:

* Prisma schema
* Seed data
* Backend API
* Auth/session/JWT
* Product/search/category API
* Cart/checkout/order API
* Admin API
* Validate dữ liệu
* Response contract
* TypeScript/backend build errors
* Docker/deploy config nếu cần

ANTIGRAVITY phụ trách chính:

* Navbar/Header/Footer
* Breadcrumb component
* Search UI/filter UI
* Category page UI
* Product detail UI
* ProductCard
* Cart UI
* Checkout UI
* Account UI
* Admin UI
* Responsive
* Loading/empty/error states
* Frontend TypeScript/build errors

LUẬT KHÔNG ĐƯỢC PHÁ:

1. Không rewrite toàn bộ project.
2. Không đổi stack.
3. Không xóa auth/payment/checkout hiện có.
4. Không đổi database provider.
5. Không commit `.env`.
6. Không force push.
7. Không để link navbar chết.
8. Không để button chính không có xử lý, nếu chưa xử lý được thì disable và ghi rõ.
9. Không đổi API contract đột ngột làm frontend/backend lệch nhau.
10. Nếu đổi contract, phải giữ fallback tương thích.

API CONTRACT ƯU TIÊN DÙNG CHUNG:

Products/search response:
{
"items": [],
"products": [],
"pagination": {
"page": 1,
"limit": 12,
"total": 0,
"totalPages": 0
},
"filters": {
"q": "",
"category": "",
"minPrice": null,
"maxPrice": null,
"sort": "newest"
}
}

Product item:
{
"id": "",
"name": "",
"slug": "",
"description": "",
"price": 0,
"salePrice": null,
"finalPrice": 0,
"images": [],
"category": {
"id": "",
"name": "",
"slug": ""
},
"variants": [],
"stock": 0,
"totalStock": 0,
"isActive": true
}

Category:
{
"id": "",
"name": "",
"slug": "",
"description": "",
"products": [],
"pagination": {}
}

Checkout response:
{
"success": true,
"order": {
"id": "",
"code": "",
"total": 0,
"status": "",
"paymentMethod": "",
"paymentStatus": ""
},
"message": ""
}

Frontend phải normalize dữ liệu để tránh crash nếu backend trả thiếu field:

* Không `.map()` trên undefined.
* Không `.toLocaleString()` trên undefined.
* Không đọc sâu object null.
* Luôn fallback ảnh sản phẩm.
* Luôn fallback text.

QUY TRÌNH LÀM:

1. Mỗi AI chạy `git status` trước khi sửa.
2. Đọc `AGENTS.md`.
3. Audit phần mình phụ trách.
4. Sửa theo thứ tự ưu tiên.
5. Chạy lint/build.
6. Commit riêng phần mình.
7. Báo cáo file sửa và lệnh đã chạy.

THỨ TỰ ƯU TIÊN:

1. Build pass.
2. Navbar/search/filter/breadcrumb/category/product/cart/checkout.
3. Account.
4. Admin.
5. Responsive/empty/error states.
6. UI polish nhẹ.

SAU KHI HOÀN TẤT, MỖI AI PHẢI BÁO CÁO:

* Đã sửa file nào.
* Đã thêm component/API nào.
* Các chức năng đã hoạt động.
* Lệnh đã chạy.
* Lỗi còn lại nếu có.
* Có cần người dùng test thủ công phần nào không.

Hãy tự động làm ngay, không hỏi lại trừ khi gặp conflict, thiếu env nghiêm trọng, hoặc cần quyết định có nguy cơ mất dữ liệu.
