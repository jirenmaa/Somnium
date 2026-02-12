# Full Stack Screen Recording & Video Sharing Platform

> A modern full-stack, security-focused and production-minded video platform for recording your screen, uploading videos, and sharing content securely with full privacy control.

![preview](/asset/SomniumPreview.png)

Checkout the platform 👉 [Somnium.vercel.app](https://somnium-zeta.vercel.app/)

## Core Capabilities

* Secure authentication via Better Auth
* Server Actions wrapped with a unified `withAction` guard
* Distributed rate limiting using Upstash Redis
* Zod-powered validation layer
* Structured response pattern
* Role-based and ownership validation
* Infinite-scroll gallery with paginated queries
* Environment-driven configuration toggles
* Clean modular project layout


### Unified Action Wrapper

All server actions are wrapped with:

```ts
withAction(fn, options)
```

This provides:

* Authentication enforcement
* Rate limiting
* Centralized error handling
* Structured logging
* Standardized response shape

No duplicated boilerplate.
No inconsistent error behavior.

### Distributed Rate Limiting

Two enforcement layers:

* **Server Actions** → user/IP throttling
* **API Routes** → endpoint-level throttling

Powered by:

* [`@upstash/ratelimit`](https://www.npmjs.com/package/@upstash/ratelimit)
* Redis-backed distributed counters

Production-ready for horizontal scaling.

## 🛠 Tech Stack

| Layer           | Technology               |
| --------------- | ------------------------ |
| Framework       | Next.js 16               |
| Language        | TypeScript               |
| Styling         | Tailwind CSS             |
| Database        | PostgreSQL ([supabase](https://supabase.com/)) + Drizzle ORM |
| Auth            | [Better Auth](https://www.better-auth.com/)              |
| Rate Limiting   | [Upstash Redis](https://console.upstash.com/)            |
| Validation      | Zod                      |
| Image Handling  | [ImageKit](https://imagekit.io/)                 |
| Package Manager | pnpm                     |


## ⚙️ Environment Configuration

Copy the example:

```bash
cp env.example .env.local
```

Key variables:

```env
DATABASE_URL=postgresql://[YOUR_DATABASE]:[YOUR_PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres

# Better Auth
BETTER_AUTH_SECRET=
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Imagekit
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=

# supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Upstash
UPSTASH_REDIS_REST_URL="https://[YOUR-URL].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[YOUR_TOKEN]"
# Toggle request rate limiting.
# "false" → rate limiting enabled (recommended, especially in production)
# "true"  → rate limiting disabled (use only for local development/testing)
DISABLE_RATE_LIMIT="true"
```

Rate limiting automatically disables in development.

## 🚦 Running Locally

```bash
pnpm install
pnpm dev
```

Production:

```bash
pnpm build
pnpm start
```

## Future Improvements

* S3-compatible storage adapter
* Background job processing
* Calculate Views

## License

[MIT](/LICENSE)