# Thanh Huong Store

Thanh Huong Store la he thong ban hang full-stack cho shop, gom catalog san pham,
gio hang, checkout, thanh toan, tai khoan khach hang va khu vuc quan tri.

## Tech Stack

- Next.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Docker va Docker Compose

## Yeu Cau He Thong

- Node.js 18 tro len
- npm
- PostgreSQL 15 tro len
- Redis 7 tro len
- Docker Desktop hoac Docker Engine neu chay bang container

## Cai Dat Local

1. Cai dependency:

```bash
npm install
```

2. Tao file `.env` tu file mau:

```bash
cp .env.example .env
```

Tren PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Dien cac gia tri local vao `.env`. Khong commit file `.env`.

4. Sinh Prisma Client:

```bash
npm run prisma:generate
```

5. Tao migration cho moi truong development:

```bash
npx prisma migrate dev --name init
```

Neu chi can dong bo schema nhanh tren database local tam thoi:

```bash
npx prisma db push
```

6. Nap du lieu mau:

```bash
npm run db:seed
```

7. Khoi dong ung dung:

```bash
npm run dev
```

Mo `http://localhost:3000`.

## Bien Moi Truong

Bat dau tu [`.env.example`](./.env.example). Khong ghi secret that vao source code,
README, commit hoac Docker image.

### Database

| Bien | Bat buoc | Mo ta |
| --- | --- | --- |
| `DATABASE_URL` | Co | PostgreSQL connection string cho Prisma runtime. |
| `DIRECT_URL` | Co | Ket noi PostgreSQL truc tiep cho migrate, generate va seed. Local co the giong `DATABASE_URL`. |
| `POSTGRES_PASSWORD` | Khi dung Docker | Mat khau PostgreSQL duoc Docker Compose su dung. |

### Authentication

He thong hien dung JWT custom. Hai secret phai khac nhau va du dai; backend se bao
loi cau hinh neu thieu.

| Bien | Bat buoc | Mo ta |
| --- | --- | --- |
| `JWT_SECRET` | Co | Secret ky access token. |
| `JWT_REFRESH_SECRET` | Co | Secret rieng ky refresh token. |
| `NEXT_PUBLIC_APP_URL` | Co | URL public cua ung dung, vi du `http://localhost:3000`. |

### Redis

| Bien | Bat buoc | Mo ta |
| --- | --- | --- |
| `REDIS_URL` | Nen co | Connection string Redis cho cache va queue. |
| `REDIS_PASSWORD` | Khi dung Docker | Mat khau Redis duoc Docker Compose su dung. |

### SMTP

| Bien | Bat buoc | Mo ta |
| --- | --- | --- |
| `SMTP_HOST` | Khi gui email | SMTP server. |
| `SMTP_PORT` | Khi gui email | SMTP port, thuong la `587`. |
| `SMTP_USER` | Khi gui email | Tai khoan SMTP. |
| `SMTP_PASS` | Khi gui email | Mat khau hoac app password SMTP. |
| `SMTP_FROM` | Khi gui email | Dia chi nguoi gui. |
| `START_EMAIL_WORKER` | Khong | Bat worker email khi dat thanh `true`. |

### VNPay

Tat ca bien ben duoi bat buoc khi bat thanh toan VNPay. Khong co fallback secret.

| Bien | Mo ta |
| --- | --- |
| `VNPAY_TMN_CODE` | Ma website do VNPay cap. |
| `VNPAY_HASH_SECRET` | Secret xac thuc chu ky VNPay. |
| `VNPAY_URL` | Cong thanh toan VNPay sandbox hoac production. |
| `VNPAY_RETURN_URL` | URL return cua ung dung. |

### Chuyen Khoan Ngan Hang

Thong tin tai khoan nhan tien dang duoc quan ly trong `src/lib/constants.ts`.
Kiem tra lai cau hinh nay truoc khi deploy. Neu chuyen sang env, su dung cac bien
`NEXT_PUBLIC_BANK_ID`, `NEXT_PUBLIC_BANK_ACCOUNT` va
`NEXT_PUBLIC_BANK_ACCOUNT_NAME`; cac bien `NEXT_PUBLIC_*` co the bi client doc
duoc nen khong dat secret vao day.

### Bien Tuy Chon

| Bien | Mo ta |
| --- | --- |
| `ANTHROPIC_API_KEY` | Chi khai bao neu tinh nang AI runtime can su dung. |

## Seed Database

Script seed nam tai `prisma/seed.ts`.

```bash
npm run prisma:generate
npm run db:seed
```

Seed hien tai xoa du lieu lien quan truoc khi tao lai du lieu mau. Chi chay seed
tren database local, staging dung rieng hoac database da duoc phep reset. Khong
chay seed tren database production dang co du lieu kinh doanh.

## Chay Bang Docker

1. Tao `.env` tu `.env.example` va dien password/secret.
2. Kiem tra cau hinh Compose:

```bash
docker compose config
```

3. Build va khoi dong cac service PostgreSQL, Redis, migration, Next.js, Nginx:

```bash
docker compose up --build -d
```

4. Kiem tra trang thai va log:

```bash
docker compose ps
docker compose logs -f nextjs
```

5. Dung container khi can:

```bash
docker compose down
```

Service `migrate` chay `npx prisma migrate deploy` truoc khi Next.js khoi dong.
Docker Compose dung volume rieng cho PostgreSQL, Redis va
`public/uploads/products`. Khong chay `docker compose down -v` neu can giu du
lieu.

## Build Production

Build truc tiep:

```bash
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run build
npm run start
```

Checklist truoc khi deploy:

1. Dat toan bo secret trong secret manager hoac bien moi truong cua he thong deploy.
2. Tao va commit Prisma migration can thiet truoc khi chay `npx prisma migrate deploy`.
3. Dung PostgreSQL va Redis production co backup, password manh va network gioi han.
4. Gan persistent volume cho `public/uploads/products`.
5. Kiem tra domain, HTTPS, Nginx va VNPay production callback.
6. Khong seed database production.

## Scripts

| Lenh | Cong dung |
| --- | --- |
| `npm run dev` | Chay Next.js development server. |
| `npm run build` | Build production. |
| `npm run start` | Chay production server da build. |
| `npm run prisma:generate` | Sinh Prisma Client. |
| `npm run prisma:migrate` | Tao migration development. |
| `npm run db:seed` | Nap lai du lieu mau. |

## Phan Cong AI

File `AGENTS.md` tai root project la noi quy phoi hop. Truoc khi sua code:

- Codex phai doc `AGENTS.md` va phu trach Backend, Database, Security, Infrastructure.
- Antigravity phai doc `AGENTS.md` va phu trach Frontend, UI, UX.

Cap nhat `AGENTS.md` khi phan cong hoac quy tac ky thuat cua project thay doi.
