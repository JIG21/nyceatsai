"use client";

import { useState } from "react";
import Image from "next/image";

type Restaurant = {
  name: string;
  neighborhood?: string;
  photos?: string[];
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

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function Home() {
  const [launched, setLaunched] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text:
        "👋 Hi! I’m TEA — your NYC food intelligence engine.\n" +
        "Ask me things like:\n" +
        "• Best halal spots in Brooklyn under $20\n" +
        "• Quiet date-night places in SoHo\n" +
        "• New restaurants opening soon in Manhattan\n" +
        "• Pizza spots going viral on X right now",
    },
  ]);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleLaunch = () => {
    const btn = document.getElementById("launch-btn");
    btn?.classList.add("scale-90", "opacity-60");

    setLaunched(true);
    setTimeout(() => setLoaded(true), 1500);
  };

  const handleSend = async () => {
    const query = input.trim();
    if (!query || isThinking) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/tea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.answer },
        ]);
      }

      if (Array.isArray(data.restaurants)) {
        setRestaurants(data.restaurants);
        setExpandedIndex(null);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ TEA ran into a problem. Check your API keys or try again.",
        },
      ]);
    }

    setIsThinking(false);
  };

  return (
    <main className="min-h-screen bg-future flex flex-col items-center justify-center px-4 py-10 text-white">

      {/* HERO */}
      {!launched && (
        <section className="flex flex-col items-center animate-fade-in">
          <div className="relative flex flex-col items-center">
            <div className="absolute w-[320px] h-[320px] rounded-full bg-white/10 blur-3xl"></div>

            <div className="glass p-6 rounded-3xl shadow-xl relative z-20">
              <Image
                src="/appstore.png"
                alt="TEA Logo"
                width={200}
                height={200}
                className="rounded-3xl"
                priority
              />
            </div>
          </div>

          <h1 className="text-center font-extrabold text-5xl md:text-7xl glow leading-tight mt-10">
            NYC <span className="text-emerald-400">EatsAI</span>
          </h1>

          <p className="mt-4 text-slate-200 text-center max-w-xl text-lg">
            Real-time NYC food intelligence — powered by TEA, Grok, Google, and the live internet.
          </p>

          <button
            id="launch-btn"
            onClick={handleLaunch}
            className="
              mt-10 px-8 py-4 rounded-full 
              bg-white text-black font-semibold text-lg
              shadow-[0_0_20px_rgba(255,255,255,0.5)]
              animate-pulse-slow
              hover:scale-110 hover:shadow-[0_0_40px_rgba(255,255,255,0.9)]
              active:scale-95 transition-all duration-300
            "
          >
            Launch TEA 🚀
          </button>
        </section>
      )}

      {/* LOADING */}
      {launched && !loaded && (
        <section className="flex flex-col items-center text-center animate-launch-mode">
          <h2 className="text-4xl font-bold glow mb-4">TEA Online</h2>
          <p className="text-slate-200 max-w-lg text-lg mb-8">
            Connecting to live NYC food data…
          </p>
          <div className="w-20 h-20 border-t-4 border-emerald-400 rounded-full animate-spin"></div>
        </section>
      )}

      {/* MAIN UI */}
      {loaded && (
        <section className="w-full max-w-7xl mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CHAT PANEL */}
          <div className="glass p-6 rounded-3xl h-[600px] flex flex-col overflow-hidden">
            <h2 className="text-2xl font-bold glow text-center">TEA Assistant</h2>

            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={
                    m.role === "user"
                      ? "bg-emerald-500/20 p-3 rounded-xl text-emerald-200 ml-auto max-w-[80%]"
                      : "bg-white/10 p-3 rounded-xl text-slate-100 max-w-[90%]"
                  }
                >
                  {m.text.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ))}

              {isThinking && (
                <div className="bg-white/10 p-3 rounded-xl text-slate-200 w-fit flex gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-300"></span>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-2">
              <input
                className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-sm"
                placeholder="Ask TEA something…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="px-5 py-3 rounded-full bg-emerald-500 text-black hover:bg-emerald-400"
              >
                Send
              </button>
            </div>
          </div>

          {/* RESTAURANT INTEL */}
          <div className="glass p-6 rounded-3xl h-[600px] overflow-y-auto">
            <h2 className="text-2xl font-bold glow text-center mb-4">NYC Food Intel</h2>

            <div className="grid gap-4">

              {restaurants.length === 0 && (
                <p className="text-center text-slate-300 text-sm">
                  Ask TEA a question to load real-time NYC restaurant intelligence.
                </p>
              )}

              {restaurants.map((r, idx) => {
                const isExpanded = expandedIndex === idx;

                const q = encodeURIComponent(
                  r.map_query || `${r.name} ${r.neighborhood ?? "NYC"}`
                );

                const mapEmbed = `https://www.google.com/maps?q=${q}&output=embed`;
                const directionsEmbed = `https://www.google.com/maps?output=embed&daddr=${q}`;

                return (
                  <div
                    key={idx}
                    className={`
                      p-4 rounded-2xl bg-white/5 border border-white/10
                      hover:bg-white/10 hover:scale-[1.02]
                      transition shadow-[0_0_15px_rgba(255,255,255,0.1)]
                      ${isExpanded ? "ring-2 ring-emerald-400/60" : ""}
                    `}
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  >
                    <h3 className="text-lg font-semibold">{r.name}</h3>

                    <p className="text-sm text-slate-300 mt-1">
                      {r.neighborhood || "NYC"}
                      {r.rating && ` · ⭐ ${r.rating}`}
                      {r.price_level && ` · ${r.price_level}`}
                    </p>

                    {/* EXPANDED PANEL */}
                    {isExpanded && (
                      <PhotoMapPanel
                        r={r}
                        mapEmbed={mapEmbed}
                        directionsEmbed={directionsEmbed}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/* ------------------------------------------------------------
        EXPANDED PANEL: MAP │ DIRECTIONS │ PHOTOS
------------------------------------------------------------ */
function PhotoMapPanel({
  r,
  mapEmbed,
  directionsEmbed,
}: {
  r: Restaurant;
  mapEmbed: string;
  directionsEmbed: string;
}) {
  const [tab, setTab] = useState("map");

  return (
    <div className="mt-4 bg-white/5 border border-white/10 p-3 rounded-xl">
      {/* TABS */}
      <div className="flex gap-2 mb-3">
        {["map", "dir", "photos"].map((t) => (
          <button
            key={t}
            className={`
              px-3 py-1 rounded-full text-xs
              ${tab === t ? "bg-emerald-500 text-black" : "bg-white/10 text-white"}
            `}
            onClick={(e) => {
              e.stopPropagation();
              setTab(t);
            }}
          >
            {t === "map" && "Map"}
            {t === "dir" && "Directions"}
            {t === "photos" && "Photos"}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="w-full h-48 rounded-xl overflow-hidden border border-white/20">
        {tab === "map" && <iframe src={mapEmbed} className="w-full h-full" />}
        {tab === "dir" && <iframe src={directionsEmbed} className="w-full h-full" />}

        {/* PHOTO GALLERY */}
        {tab === "photos" && (
          <div className="flex gap-3 overflow-x-auto p-2 h-full">
            {r.photos?.map((p, i) => (
              <img
                key={i}
                src={p}
                className="w-40 h-40 object-cover rounded-xl border border-white/10"
              />
            ))}

            {!r.photos?.length && (
              <p className="text-slate-300 text-xs p-3">No photos found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
