This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### API Configuration (Dev/Prod)

Browser memanggil **same-origin** path `/jobs-api/*` dan `/mana-uang-api/*`; Next.js
meng-**rewrite** ke backend lewat `JOBS_API_BASE_URL` dan `MANA_UANG_API_BASE_URL`
(lihat `next.config.ts`). Berguna saat frontend ditunnel (mis. Cloudflare) tanpa
mementer koneksi langsung ke IP/port backend dari browser.

Copy env example:

```bash
cp .env.example .env.local
```

Set backend URL dan PIN di `.env.local`:

```bash
JOBS_API_BASE_URL=http://100.123.25.78:8088
MANA_UANG_API_BASE_URL=http://100.123.25.78:8089
APP_LOGIN_PIN=pin-kamu
APP_SESSION_SECRET=string-acak-panjang
```

Untuk rewrites backend: jika `JOBS_API_BASE_URL` / `MANA_UANG_API_BASE_URL` tidak diset, Next fallback ke `NEXT_PUBLIC_*` lalu ke `http://127.0.0.1:8088` dan `:8089` saat config dibaca.

### Akses & login

Semua rute (kecuali `/login` dan `/api/auth/*`) membutuhkan cookie sesi HTTP-only bertanda HMAC.
Di development, jika `APP_SESSION_SECRET` kosong, dipakai nilai fallback tidak aman (hanya untuk lokal).

Setelah login, proxy `/jobs-api` / `/mana-uang-api` ikut dilindungi middleware. Tombol **Keluar** di header membersihkan sesi.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
