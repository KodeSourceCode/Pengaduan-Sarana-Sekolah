# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## API Access Policy

Dokumen ringkas aturan endpoint publik dan privat.

| Endpoint                 | Method | Access     | Keterangan                          |
| ------------------------ | ------ | ---------- | ----------------------------------- |
| /api/auth/login          | POST   | Public     | Login user                          |
| /api/aspirasi/publik     | GET    | Public     | Listing aspirasi publik + statistik |
| /api/auth/register-siswa | POST   | Admin only | Registrasi akun siswa               |
| /api/aspirasi            | GET    | Admin only | Listing admin dengan filter         |

- `GET /api/aspirasi` tidak lagi menerima mode query untuk perilaku publik.
- Endpoint publik harus menggunakan jalur khusus `/api/aspirasi/publik`.
- Aturan enforcement utama berada di `server/middleware/auth.ts`.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
