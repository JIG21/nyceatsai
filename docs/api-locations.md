# API file locations

This project uses the Next.js App Router. Each API lives in its own folder under `app/api/<endpoint>` with a `route.ts` file that exports HTTP method handlers (e.g., `GET`, `POST`).

## Existing endpoints

- `app/api/restaurants/route.ts` — returns the static restaurants dataset.
- `app/api/tea/route.ts` — TEA intelligence engine that calls Grok, Google Maps, and Yelp.

## How to add a new API

1. Create a new folder under `app/api` named after the endpoint path (for example, `app/api/places`).
2. Inside that folder, add a `route.ts` file.
3. Export handlers for the HTTP methods you need, such as:

```ts
// app/api/places/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}
```

The endpoint will be available at `/api/<folder-name>` when the app runs.
