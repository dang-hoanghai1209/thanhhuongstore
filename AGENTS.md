# Thanh Hương Store - AI Collaboration Rules

## 1. Source Of Truth

- Database schema source of truth: `prisma/schema.prisma`.
- Do not duplicate schema content in `AGENTS.md`.
- Đọc file cấu hình hoặc source code liên quan trước khi sửa. Không dựa vào bản sao cũ trong tài liệu.

## 2. Tech Stack

- Framework: Next.js App Router
- Language: TypeScript
- Database ORM: Prisma
- Database Engine: PostgreSQL
- Cache and queue: Redis
- Styling: Tailwind CSS
- Deployment: Docker và Docker Compose

## 3. Next.js Rules

- `page.tsx` dùng cho route/page.
- UI tái sử dụng nên tách vào `components`.
- Mặc định ưu tiên Server Components.
- Chỉ dùng `'use client'` khi component cần `useState`, `useEffect`, `onClick` hoặc browser API.
- API App Router đặt trong `route.ts` và dùng các handler phù hợp như `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Backend API trả JSON bằng `NextResponse.json()`, validate input và xử lý lỗi rõ ràng.
- Dùng Prisma Client cho thao tác database. Không dùng raw SQL nếu không có yêu cầu kỹ thuật đặc biệt và lý do được ghi rõ.

## 4. Codex Responsibilities

Codex là Backend/Infrastructure Lead, phụ trách:

- Backend và API `route.ts`
- Prisma schema, migration, seed và database
- Authentication, authorization và middleware
- Server utilities trong `src/lib`
- Docker, Docker Compose, env config và infrastructure
- `README.md`, `.gitignore` và tài liệu vận hành khi liên quan backend hoặc deploy
- Bảo mật, validation, status code và kiểm tra build backend

Codex không sửa UI, UX, `page.tsx`, `layout.tsx` hoặc components trừ khi được yêu cầu rõ ràng hoặc thay đổi là bắt buộc để hoàn thành tác vụ. Khi cần sửa ngoài phạm vi, phải ghi rõ lý do trong báo cáo.

## 5. Antigravity Responsibilities

Antigravity là Frontend Lead, phụ trách:

- `page.tsx`, `layout.tsx` và components
- UI, UX và Tailwind CSS
- Responsive layout
- Loading, empty và error states
- Tích hợp API phía client dựa trên contract backend

Antigravity không sửa `prisma/schema.prisma`, API `route.ts`, auth backend, Docker hoặc env config trừ khi được yêu cầu rõ ràng. Khi cần sửa ngoài phạm vi, phải ghi rõ lý do trong báo cáo.

## 6. Conflict Rules

- Không ghi đè hoặc hoàn tác code của agent khác nếu không cần thiết.
- Trước khi sửa file đang có thay đổi, đọc kỹ diff hiện tại và giữ lại phần không thuộc nhiệm vụ.
- Nếu cần sửa ngoài phạm vi phụ trách, ghi rõ lý do và danh sách file trong báo cáo.
- Backend cung cấp JSON contract hoặc mock data chi tiết khi hoàn thành API để Frontend tích hợp.
- Frontend không giả lập API thành công nếu backend chưa implement; dùng trạng thái lỗi hoặc `501 Not Implemented` theo contract.

## 7. Testing Checklist

Chạy các lệnh phù hợp với phạm vi thay đổi trước khi báo hoàn thành. Không bắt buộc chạy tất cả nếu không liên quan hoặc môi trường thiếu cấu hình.

```bash
npm run build
npx tsc --noEmit
npm run lint
npx prisma generate
```

Quy tắc áp dụng:

- Chạy `npm run build` cho thay đổi có thể ảnh hưởng build.
- Chạy `npx tsc --noEmit` để kiểm tra TypeScript.
- Chạy `npm run lint` nếu project có lint hoạt động.
- Chạy `npx prisma generate` nếu đụng Prisma schema hoặc Prisma Client config.
- Nếu không thể chạy một lệnh, ghi rõ lý do trong báo cáo.

## 8. Completion Report

Khi hoàn thành task, agent phải báo cáo:
- File đã sửa
- Tóm tắt thay đổi
- Lệnh đã chạy
- Lỗi còn tồn tại nếu có
- Việc nào cần agent còn lại xử lý tiếp 