"use client";

import { useState } from "react";
import Image from "next/image";

type Restaurant = {
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

  const handleLaunch = () => {
    const btn = document.getElementById("launch-btn");
    btn?.classList.add("scale-90", "opacity-60");

    setLaunched(true);
    setTimeout(() => {
      setLoaded(true);
    }, 1500);
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

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error("TEA API error:", errJson);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text:
              "⚠️ Something went wrong on the TEA brain. Try again in a moment or check your API keys.",
          },
        ]);
        setIsThinking(false);
        return;
      }

      const data = (await res.json()) as {
        answer?: string;
        restaurants?: Restaurant[];
      };

      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.answer ?? "" },
        ]);
      }

      if (Array.isArray(data.restaurants)) {
        setRestaurants(data.restaurants);
      }
    } catch (err) {
      console.error("Unexpected TEA client error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "⚠️ Unexpected error reaching TEA. Check console logs and server.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const openInGoogleMaps = (r: Restaurant) => {
    const url =
      r.map_url ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${r.name} ${r.neighborhood ?? "New York City"}`
      )}`;

    window.open(url, "_blank", "noopener,noreferrer");
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

          <h1 className="text-center font-extrabold text-5xl md:text-7xl tracking-tight glow leading-tight mt-10">
            NYC <span className="text-emerald-400">EatsAI</span>
          </h1>

          <p className="mt-4 text-slate-200 text-center max-w-xl text-lg">
            Real-time NYC food intelligence — powered by TEA, Grok, Google, and
            the live internet.
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
              active:scale-95
              transition-all duration-300
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

      {/* MAIN INTERFACE */}
      {loaded && (
        <section className="w-full max-w-7xl mx-auto animate-launch-mode mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          {/* CHAT PANEL */}
          <div className="glass p-6 rounded-3xl flex flex-col h-[600px] overflow-hidden">
            <h2 className="text-2xl font-bold glow mb-4 text-center">
              TEA Assistant
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={
                    m.role === "user"
                      ? "bg-emerald-500/20 p-3 rounded-xl text-sm text-emerald-200 ml-auto max-w-[80%]"
                      : "bg-white/10 p-3 rounded-xl text-sm text-slate-100 max-w-[90%]"
                  }
                >
                  {m.text.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ))}

              {/* Typing / thinking indicator */}
              {isThinking && (
                <div className="bg-white/10 p-3 rounded-xl text-sm text-slate-200 flex items-center gap-1 w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce opacity-70" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce opacity-70 delay-150" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce opacity-70 delay-300" />
                </div>
              )}
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Ask TEA something..."
                  className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  onClick={handleSend}
                  disabled={isThinking}
                  className="
                    px-5 py-3 rounded-full font-semibold
                    bg-emerald-500 text-black 
                    hover:bg-emerald-400
                    disabled:bg-emerald-700 disabled:cursor-not-allowed
                    transition
                  "
                >
                  {/* Always show 'Send' text */}
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* RESTAURANT INTELLIGENCE PANEL */}
          <div className="glass p-6 rounded-3xl h-[600px] overflow-y-auto">
            <h2 className="text-2xl font-bold glow mb-4 text-center">
              NYC Food Intel
            </h2>

            <div className="grid gap-4">
              {restaurants.length === 0 && (
                <p className="text-slate-300 text-sm text-center">
                  Ask TEA for something — for example{" "}
                  <span className="font-semibold">
                    “New ramen spots opening soon in Manhattan”
                  </span>{" "}
                  — and I’ll fill this panel with live intel.
                </p>
              )}

              {restaurants.map((r, idx) => (
                <div
                  key={idx}
                  className="
                    p-4 rounded-2xl 
                    bg-white/5 border border-white/10
                    hover:bg-white/10 hover:scale-[1.02]
                    transition cursor-pointer 
                    shadow-[0_0_15px_rgba(255,255,255,0.08)]
                  "
                  onClick={() => openInGoogleMaps(r)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">{r.name}</h3>
                    {r.opening_soon && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500 text-black font-semibold">
                        Opening Soon
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 mt-1">
                    {r.neighborhood || "NYC"}
                    {typeof r.rating === "number" &&
                      ` · ⭐ ${r.rating.toFixed(1)}`}
                    {r.price_level && ` · ${r.price_level}`}
                  </p>

                  {r.busy_status && (
                    <p className="text-xs text-slate-300 mt-1">
                      🕒 Now:{" "}
                      <span className="font-semibold">{r.busy_status}</span>
                    </p>
                  )}

                  {typeof r.trend_score === "number" && (
                    <p className="text-xs text-slate-300 mt-1">
                      🔥 Trend score: {r.trend_score}/100
                    </p>
                  )}

                  {r.influencers && r.influencers.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      👤 Seen by: {r.influencers.join(", ")}
                    </p>
                  )}

                  {r.specialties && r.specialties.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      🍽 Special: {r.specialties.join(" · ")}
                    </p>
                  )}

                  {r.deals && r.deals.length > 0 && (
                    <p className="text-xs text-emerald-300 mt-1">
                      💸 Deals: {r.deals.join(" · ")}
                    </p>
                  )}

                  <p className="text-[11px] text-emerald-300 mt-2 underline">
                    Open in Google Maps
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
