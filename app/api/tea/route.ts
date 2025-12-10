import { NextResponse } from "next/server";

const XAI_API_KEY = process.env.XAI_API_KEY;
const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
const YELP_KEY = process.env.YELP_API_KEY;

/* ============================================================================
    POST — TEA Intelligence Engine 
============================================================================ */
export async function POST(req: Request) {
  if (!XAI_API_KEY) {
    return NextResponse.json({ error: "Missing XAI_API_KEY" }, { status: 500 });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    /* ------------------------------------------------------------
        1) Ask Grok for JSON output with REAL restaurant names
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
              "You are TEA, NYC’s food intelligence engine.\n" +
              "ALWAYS output ONLY valid JSON in this exact structure:\n\n" +
              "{\n" +
              '  "summary": "Short helpful human summary",\n' +
              '  "restaurants": ["name1", "name2", "name3"]\n' +
              "}\n\n" +
              "Rules:\n" +
              "• Restaurants MUST BE real NYC restaurants.\n" +
              "• Base them on the user's request.\n" +
              "• Always include 3–5 restaurants.\n" +
              "• Never output markdown.\n" +
              "• Never add commentary.\n" +
              "• Respond ONLY with JSON.\n",
          },
          { role: "user", content: query },
        ],
      }),
    });

    if (!grokRes.ok) {
      return NextResponse.json(
        { error: "Upstream TEA model error" },
        { status: grokRes.status }
      );
    }

    const grokJSON = await grokRes.json();

    let summary = "Here’s what I found.";
    let names: string[] = [];

    // Parse JSON from Grok safely
    try {
      const parsed = JSON.parse(grokJSON?.choices?.[0]?.message?.content || "{}");
      if (parsed.summary) summary = parsed.summary;
      if (parsed.restaurants) names = parsed.restaurants;
    } catch (err) {
      console.error("JSON parse error:", err);
    }

    if (names.length === 0) {
      names = ["Restaurant"]; // fallback (rarely used now)
    }

    /* ------------------------------------------------------------
        2) Build restaurant objects w/ photos
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
      answer: summary,
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
    Get Real Restaurant Photos
    Google → Yelp → Grok fallback
============================================================================ */
async function fetchPhotos(name: string): Promise<string[]> {
  const results: string[] = [];

  /* ------------------------------------------------------------
      A) GOOGLE PLACES PHOTOS
  ------------------------------------------------------------ */
  if (GOOGLE_KEY) {
    try {
      const googleURL =
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
        `?input=${encodeURIComponent(name + " NYC")}` +
        `&inputtype=textquery` +
        `&fields=photos,place_id` +
        `&key=${GOOGLE_KEY}`;

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
      console.warn("Google error:", e);
    }
  }

  /* ------------------------------------------------------------
      B) YELP PHOTOS
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
      C) GROK IMAGE SEARCH (fallback)
  ------------------------------------------------------------ */
  try {
    const grokImgRes = await fetch("https://api.x.ai/v1/images/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `${name} NYC restaurant interior exterior dishes`,
        num_images: 5,
      }),
    });

    const grokImgJSON = await grokImgRes.json();

    if (grokImgJSON?.images) {
      grokImgJSON.images.forEach((img: { url?: string }) => {
        if (img.url) results.push(img.url);
      });
    }
  } catch (e) {
    console.warn("Grok image error:", e);
  }

  return [...new Set(results)];
}
