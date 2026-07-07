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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Hermes sync API

This dashboard exposes a simple ingestion API for external backlink sync jobs.

### Bulk ingest

`POST /api/hermes/backlinks/bulk`

Headers:

```http
Authorization: Bearer <HERMES_INGEST_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "source": "hermes-growth-agent",
  "records": [
    {
      "externalId": "seedance2-5ai|https://example.com/post|2026-07-07T07:44:13.496Z",
      "project": "seedance2-5ai",
      "projectName": "Seedance 2.5 AI",
      "promotionWebsite": "https://seedance2-5ai.com/",
      "submitName": "Seedance AI Team",
      "submitEmail": "nosay11@yeah.net",
      "platformDomain": "example.com",
      "sourcePageUrl": "https://example.com/post",
      "platformType": "博客评论",
      "generatedContent": "评论内容…",
      "executionStatus": "已提交",
      "reviewStatus": "通过",
      "publishedAt": "2026-07-07T07:44:13.496Z",
      "recordedAt": "2026-07-07T07:44:13.496Z",
      "indexedUrl": "https://example.com/post#comment-123",
      "notes": "Hermes 自动提交；页面发现评论内容",
      "rawStatus": "submitted",
      "confidence": "visible_or_public_url",
      "evidence": "found_name; found_comment"
    }
  ]
}
```

Response:

```json
{
  "ok": true,
  "inserted": 2,
  "updated": 1,
  "skipped": 0
}
```

### Health check

`GET /api/hermes/health`

Response:

```json
{
  "ok": true,
  "service": "backlink-dashboard",
  "version": "1.0.0"
}
```

### Frontend data source

The dashboard table reads from the same Hermes store via `GET /api/hermes/backlinks`. If the server store is empty, the UI falls back to the local demo data.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
