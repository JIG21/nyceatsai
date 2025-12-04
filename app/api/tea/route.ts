import { NextRequest, NextResponse } from "next/server";

type TeaRequestBody = {
  query: string;
};

type GrokRestaurant = {
  name: string;
  neighborhood?: string;
  categories?: string[];
  rating?: number | null;
  price_level?: string | null;
  eta_minutes?: number | null;
  busy_status?: string | null;
  trend_score?: number | null;
  influencers?: string[];
  specialties?: string[];
  deals?: string[];
  opening_soon?: boolean;
  map_query?: string;
  map_url?: string;
};

type TeaResponse = {
  answer: string;
  restaurants: GrokRestaurant[];
};

// ---- helpers ----

async function callGrok(query: string, apiKey: string): Promise<TeaResponse> {
  const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are TEA, an AI NYC food intelligence engine. " +
            "You have real-time access to X (Twitter) and the web via Grok. " +
            "Use that to detect trending restaurants, promotions, deals, " +
            "influencer/celebrity visits, places that are busy or quiet, and new spots opening soon. " +
            "Always respond in pure JSON ONLY.",
        },
        {
          role: "user",
          content:
            "User question: " +
            query +
            "\n\nReturn ONLY JSON with this shape:\n" +
            "{\n" +
            '  "answer": "short natural-language explanation",\n' +
            '  "restaurants": [\n' +
            "    {\n" +
            '      "name": "string",\n' +
            '      "neighborhood": "string",\n' +
            '      "categories": ["Pizza", "Halal", "Sushi"],\n' +
            '      "rating": number | null,\n' +
            '      "price_level": "string like $, $$, $$$ or null",\n' +
            '      "eta_minutes": number | null,\n' +
            '      "busy_status": "Busy" | "Moderate" | "Quiet" | null,\n' +
            '      "trend_score": number | null,\n' +
            '      "influencers": ["@handle1", "@handle2"],\n' +
            '      "specialties": ["signature dish 1", "signature dish 2"],\n' +
            '      "deals": ["20% off weekdays", "happy hour 5-7pm"],\n' +
            '      ' +
            '"opening_soon": boolean,\n' +
            '      "map_query": "string to build maps query",\n' +
            '      "map_url": "direct maps url if you infer it"\n' +
            "    }\n" +
            "  ]\n" +
            "}\n" +
            "If you are not sure about some fields, use null or empty arrays.",
        },
      ],
    }),
  });

  if (!grokRes.ok) {
    const text = await grokRes.text();
    console.error("Grok error:", grokRes.status, text);
    throw new Error("Grok API error");
  }

  const json = await grokRes.json();
  const content = json?.choices?.[0]?.message?.content ?? "{}";

  let parsed: TeaResponse;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    console.error("Failed to parse Grok JSON:", err, content);
    parsed = {
      answer: "I had trouble parsing Grok output. Showing raw text.",
      restaurants: [],
    };
  }

  if (!Array.isArray(parsed.restaurants)) {
    parsed.restaurants = [];
  }

  return parsed;
}

// Optionally extend with Google Places for better rating / busy info
async function enrichWithGooglePlaces(
  restaurants: GrokRestaurant[],
  googleApiKey?: string
): Promise<GrokRestaurant[]> {
  if (!googleApiKey || restaurants.length === 0) return restaurants;

  // NOTE:
  // This is a placeholder for a real Google Places lookup.
  // You should call the Places API (Text Search or Nearby Search) here:
  // https://developers.google.com/maps/documentation/places/web-service/search-text
  //
  // 1) For each restaurant, build a query string: `${name} ${neighborhood} New York`
  // 2) Call Places API, e.g.:
  //    https://maps.googleapis.com/maps/api/place/textsearch/json?query=...&key=...
  // 3) Merge rating, price_level, user_ratings_total, opening_hours, etc.
  //
  // For now, this function just returns the restaurants untouched,
  // but the structure is ready for you to plug in your Places calls.
  return restaurants;
}

// Optionally extend with Yelp / other sources (scraping, proxies, etc.)
async function enrichWithYelp(
  restaurants: GrokRestaurant[],
  yelpApiKey?: string
): Promise<GrokRestaurant[]> {
  if (!yelpApiKey || restaurants.length === 0) return restaurants;

  // Placeholder: this is where you would call Yelp Fusion API or
  // your own scraping proxy to fetch extra review data, price,
  // photos, categories, etc.
  //
  // Because direct scraping may violate ToS depending on how you do it,
  // implement that on your own backend/infrastructure and call it here.
  //
  return restaurants;
}

// Build a Google Maps URL if Grok or Places didn’t give us one
function ensureMapFields(r: GrokRestaurant): GrokRestaurant {
  const mq =
    r.map_query || `${r.name} ${r.neighborhood ?? "New York City"} restaurant`;
  const url =
    r.map_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mq)}`;

  return {
    ...r,
    map_query: mq,
    map_url: url,
  };
}

// ---- main handler ----

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TeaRequestBody;
    const query = body?.query?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Missing 'query' in request body" },
        { status: 400 }
      );
    }

    const xaiKey = process.env.XAI_API_KEY;
    if (!xaiKey) {
      return NextResponse.json(
        { error: "XAI_API_KEY missing on server" },
        { status: 500 }
      );
    }

    const googleKey = process.env.GOOGLE_PLACES_API_KEY;
    const yelpKey = process.env.YELP_API_KEY;

    // 1) Ask Grok for realtime NYC restaurant intel
    const grokResult = await callGrok(query, xaiKey);

    // 2) Optionally enrich with Google Places
    let enriched = await enrichWithGooglePlaces(grokResult.restaurants, googleKey);

    // 3) Optionally enrich with Yelp / other data
    enriched = await enrichWithYelp(enriched, yelpKey);

    // 4) Ensure every restaurant has map info
    enriched = enriched.map(ensureMapFields);

    const response: TeaResponse = {
      answer: grokResult.answer,
      restaurants: enriched,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Unexpected /api/tea error:", err);
    return NextResponse.json(
      { error: "Unexpected TEA server error" },
      { status: 500 }
    );
  }
}
