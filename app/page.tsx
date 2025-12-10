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
    } catch {
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

  const heroPrompts = [
    "Best rooftops with skyline views tonight",
    "Where do chefs eat after service?",
    "Burgers near me that match Shake Shack vibes",
    "Eats that are blowing up on TikTok in Manhattan",
  ];

  const citySignals = [
    "Live subway heatmap synced",
    "Influencer radar online",
    "Transit-friendly picks prioritized",
    "Late-night layer active",
  ];

  return (
    <main className="min-h-screen text-white bg-night relative overflow-hidden">
      <div className="city-grid" />
      <div className="neon-orb orb-one" />
      <div className="neon-orb orb-two" />
      <div className="noise" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 lg:px-6 py-10 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 shadow-glow flex items-center justify-center font-black text-slate-900">
              NYC
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Arrival Concierge</p>
              <p className="text-2xl md:text-3xl font-bold">EatsAI City Mode</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label="Live" tone="emerald" />
            <Badge label="Map Layer" tone="cyan" />
            <Badge label="ChatOps" tone="violet" />
            <Badge label="Transit Safe" tone="amber" />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="glass-xl p-6 md:p-7 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="city-stripe" />
              <div className="city-stripe delay-300" />
            </div>

            <div className="flex flex-col gap-6 relative">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-slate-300">Welcome to the grid</p>
                  <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                    A ChatGPT-like arrival screen with Uber urgency, Snapchat Map energy, and Citymapper clarity.
                  </h1>
                </div>
                <div className="hidden md:flex flex-col items-end gap-2 text-sm text-slate-200">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">NYC · Live</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                    {loaded ? "Signal locked" : launched ? "Spooling data" : "Pre-launch"}
                  </span>
                </div>
              </div>

              {!launched && (
                <div className="grid gap-4 md:grid-cols-[2fr_1fr] items-center">
                  <div className="space-y-3">
                    <p className="text-lg text-slate-200">
                      TEA orchestrates live restaurant intel with transit, crowds, and vibe data so you can land and move like a local.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {heroPrompts.map((p) => (
                        <span
                          key={p}
                          className="px-3 py-2 rounded-full bg-white/10 border border-white/10 text-sm"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3 flex-wrap pt-2">
                      {citySignals.map((sig) => (
                        <StatusPill key={sig} text={sig} />
                      ))}
                    </div>
                  </div>

                  <div className="city-card relative">
                    <Image
                      src="/appstore.png"
                      alt="TEA"
                      width={320}
                      height={320}
                      className="rounded-3xl shadow-2xl border border-white/10"
                      priority
                    />
                    <div className="city-card-overlay">
                      <p className="text-xs text-slate-200">Ghost mode off</p>
                      <p className="text-lg font-semibold">Drop into SoHo, LES, BK, Queens</p>
                    </div>
                  </div>
                </div>
              )}

              {launched && !loaded && (
                <div className="grid md:grid-cols-2 gap-4 items-center">
                  <div>
                    <p className="text-slate-200 mb-2">Spinning up your NYC layers…</p>
                    <div className="flex flex-wrap gap-2">
                      {citySignals.map((sig) => (
                        <StatusPill key={sig} text={sig} active />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="loader-ring">
                      <div className="loader-dot" />
                      <div className="loader-dot delay-200" />
                      <div className="loader-dot delay-400" />
                    </div>
                  </div>
                </div>
              )}

              {loaded && (
                <div className="grid md:grid-cols-[1.1fr_1fr] gap-4 items-center">
                  <div className="space-y-3">
                    <p className="text-sm text-emerald-200 uppercase tracking-[0.25em]">You’re in</p>
                    <p className="text-2xl font-semibold leading-snug">
                      Live concierge unlocked. Ask, drag, and reroute your night across Manhattan, Brooklyn, Queens, or the Bronx.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <StatusPill text="Street-level map ready" active />
                      <StatusPill text="Restaurant radar synced" active />
                      <StatusPill text="Signal secure" active />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-glow flex flex-col gap-2">
                    <p className="text-sm text-slate-200">City snapshots</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Snapshot label="Downtown" value="Hi-lo mix" />
                      <Snapshot label="Brooklyn" value="Indie, late" />
                      <Snapshot label="Queens" value="Global eats" />
                      <Snapshot label="Uptown" value="Classics" />
                    </div>
                  </div>
                </div>
              )}

              {!launched && (
                <button
                  id="launch-btn"
                  onClick={handleLaunch}
                  className="w-full md:w-auto px-6 py-4 rounded-full bg-white text-black font-semibold text-lg shadow-glow hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  Enter city mode →
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="glass p-5 rounded-3xl border border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">City radar</p>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">Live map</span>
              </div>
              <div className="radar-map">
                <div className="radar-blip" />
                <div className="radar-blip delay-200" />
                <div className="radar-blip delay-400" />
              </div>
              <p className="text-sm text-slate-300">
                Think Citymapper meets Snapchat Map: pulsing layers for neighborhoods, transit flows, and trending restaurants.
              </p>
            </div>

            <div className="glass p-5 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Shortcuts</p>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10">Tap to drop</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Vibe check", "Fast cheap eats", "Date night", "Late-night slices", "Michelin flex"].map((chip) => (
                  <button
                    key={chip}
                    className="px-3 py-2 rounded-full bg-white/10 border border-white/10 text-sm hover:bg-white/20"
                    onClick={() => {
                      setInput(chip);
                      setLaunched(true);
                      setLoaded(true);
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p>Live concierge: ask once, reroute like Uber, and see the map like Snap.</p>
              </div>
            </div>
          </div>
        </section>

        {loaded && (
          <section className="grid gap-6 lg:grid-cols-[1.05fr_1.05fr]">
            <div className="glass p-6 rounded-3xl border border-white/10 h-[640px] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Conversational nav</p>
                  <h2 className="text-2xl font-bold">TEA Assistant</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 text-xs">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />Connected
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-2">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={
                      m.role === "user"
                        ? "bg-emerald-500/15 p-3 rounded-2xl text-emerald-100 ml-auto max-w-[82%] border border-emerald-500/30"
                        : "bg-white/10 p-3 rounded-2xl text-slate-100 max-w-[90%] border border-white/10"
                    }
                  >
                    {m.text.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                ))}

                {isThinking && (
                  <div className="bg-white/10 p-3 rounded-2xl text-slate-200 w-fit flex gap-1 border border-white/10">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150" />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-300" />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-2">
                <input
                  className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  placeholder="Drop your request like a DM…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="px-5 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  Send
                </button>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10 h-[640px] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-300">Live intelligence</p>
                  <h2 className="text-2xl font-bold">NYC Food Intel</h2>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10">Tap cards to expand</span>
              </div>

              <div className="grid gap-4">
                {restaurants.length === 0 && (
                  <p className="text-center text-slate-300 text-sm p-6 rounded-2xl bg-white/5 border border-white/10">
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
                        hover:bg-white/10 hover:scale-[1.01]
                        transition shadow-[0_0_25px_rgba(0,0,0,0.25)]
                        ${isExpanded ? "ring-2 ring-emerald-400/60" : ""}
                      `}
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold">{r.name}</h3>
                          <p className="text-sm text-slate-300 mt-1">
                            {r.neighborhood || "NYC"}
                            {r.rating && ` · ⭐ ${r.rating}`}
                            {r.price_level && ` · ${r.price_level}`}
                            {r.eta_minutes && ` · ${r.eta_minutes}m away`}
                          </p>
                        </div>
                        {r.trend_score && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-100 text-xs border border-emerald-500/30">
                            Trend {r.trend_score}
                          </span>
                        )}
                      </div>

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
      </div>
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
    <div className="mt-4 bg-white/5 border border-white/10 p-3 rounded-xl space-y-3">
      <div className="flex gap-2">
        {["map", "dir", "photos"].map((t) => (
          <button
            key={t}
            className={`
              px-3 py-1 rounded-full text-xs
              ${tab === t ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-black" : "bg-white/10 text-white border border-white/10"}
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

      <div className="w-full h-52 rounded-xl overflow-hidden border border-white/10 shadow-inner bg-slate-950/40">
        {tab === "map" && <iframe src={mapEmbed} className="w-full h-full" />}
        {tab === "dir" && <iframe src={directionsEmbed} className="w-full h-full" />}
        {tab === "photos" && (
          <div className="flex gap-3 overflow-x-auto p-2 h-full">
            {r.photos?.map((p, i) => (
              <Image
                key={i}
                src={p}
                alt={`Photo of ${r.name}`}
                width={160}
                height={160}
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

function Badge({ label, tone }: { label: string; tone: "emerald" | "cyan" | "violet" | "amber" }) {
  const toneMap = {
    emerald: "from-emerald-400 to-green-500",
    cyan: "from-cyan-400 to-blue-500",
    violet: "from-fuchsia-400 to-purple-500",
    amber: "from-amber-300 to-orange-500",
  } as const;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${toneMap[tone]} text-black shadow-glow`}>
      {label}
    </span>
  );
}

function StatusPill({ text, active }: { text: string; active?: boolean }) {
  return (
    <span
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
        active
          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-100"
          : "bg-white/10 border-white/10 text-slate-200"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${active ? "bg-emerald-400 animate-pulse" : "bg-white/60"}`} />
      {text}
    </span>
  );
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
