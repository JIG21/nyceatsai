import { NextResponse } from "next/server";

const XAI_API_KEY = process.env.XAI_API_KEY!;
const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;
const YELP_KEY = process.env.YELP_API_KEY || "";

/* ============================================================================
    POST — TEA Intelligence Engine 
============================================================================ */
export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json(
        { error: "Missing query" },
        { status: 400 }
      );
    }

    /* ------------------------------------------------------------
        1) Ask Grok to analyze the user prompt
    ------------------------------------------------------------ */
    const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          {
            role: "system",
            content:
              "You are TEA, NYC’s real-time food intelligence engine. " +
              "Summarize insights, extract restaurant names, neighborhoods, dishes, " +
              "and trends. Keep the response short and helpful."
          },
          { role: "user", content: query },
        ],
      }),
    });

    const grokJSON = await grokRes.json();

    const answer =
      grokJSON?.choices?.[0]?.message?.content ||
      "Here’s what I found.";

    /* ------------------------------------------------------------
        2) Extract restaurant names (backup extractor)
    ------------------------------------------------------------ */
    const extractedNames = extractRestaurants(answer);
    const names = extractedNames.length > 0 ? extractedNames : ["Restaurant"];


    /* ------------------------------------------------------------
        3) Build restaurant objects w/ photos + map intel
    ------------------------------------------------------------ */
    const restaurants = [];
    for (const name of names) {
      const photos = await fetchPhotos(name);
      restaurants.push({
        name,
        neighborhood: "NYC",
        photos,
        rating: null,
        price_level: null,
        busy_status: null,
        trend_score: null,
        influencers: [],
        specialties: [],
        deals: [],
        opening_soon: false,
        map_query: `${name} NYC`,
      });
    }

    return NextResponse.json({
      answer,
      restaurants,
    });

  } catch (err) {
    console.error("TEA SERVER ERROR:", err);

    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

/* ============================================================================
    Extract restaurant names from Grok summary
============================================================================ */
function extractRestaurants(text: string): string[] {
  const found: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const cleaned = line
      .replace("•", "")
      .replace("-", "")
      .trim();

    if (
      cleaned.length > 2 &&
      /^[A-Za-z0-9\s'&.-]+$/.test(cleaned) && // avoid weird junk
      cleaned.split(" ").length <= 5 // keep short names
    ) {
      found.push(cleaned);
    }
  }

  return [...new Set(found)];
}

/* ============================================================================
    Get Real Restaurant Photos 
    (Google → Yelp → Grok fallback)
============================================================================ */
async function fetchPhotos(name: string): Promise<string[]> {
  const results: string[] = [];

  /* ------------------------------------------------------------
        A) Google Places
  ------------------------------------------------------------ */
  const googleURL =
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${encodeURIComponent(name + " NYC")}` +
    `&inputtype=textquery` +
    `&fields=photos,place_id` +
    `&key=${GOOGLE_KEY}`;

  try {
    const googleRes = await fetch(googleURL);
    const googleJSON = await googleRes.json();

    if (googleJSON?.candidates?.[0]?.photos) {
      for (const p of googleJSON.candidates[0].photos.slice(0, 5)) {
        results.push(
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${p.photo_reference}&key=${GOOGLE_KEY}`
        );
      }
    }
  } catch (e) {
    console.warn("Google Photo error:", e);
  }

  /* ------------------------------------------------------------
        B) Yelp Photos (optional)
  ------------------------------------------------------------ */
  if (YELP_KEY) {
    try {
      const yelpRes = await fetch(
        `https://api.yelp.com/v3/businesses/search?location=NYC&term=${encodeURIComponent(name)}`,
        {
          headers: { Authorization: `Bearer ${YELP_KEY}` },
        }
      );

      const yelpJSON = await yelpRes.json();

      const biz = yelpJSON?.businesses?.[0];
      if (biz) {
        if (biz.image_url) results.push(biz.image_url);
        if (biz.photos) results.push(...biz.photos);
      }
    } catch (e) {
      console.warn("Yelp error:", e);
    }
  }

  /* ------------------------------------------------------------
        C) Grok Web Image Search (best fallback)
  ------------------------------------------------------------ */
  try {
    const grokImgRes = await fetch(`https://api.x.ai/v1/images/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `${name} NYC restaurant interior dishes outside`,
        num_images: 5,
      }),
    });

    const grokImgJSON = await grokImgRes.json();

    if (grokImgJSON?.images) {
      grokImgJSON.images.forEach((img: any) => results.push(img.url));
    }
  } catch (e) {
    console.warn("Grok Image error:", e);
  }

  /* ------------------------------------------------------------
        Remove duplicates
  ------------------------------------------------------------ */
  return [...new Set(results)];
}
