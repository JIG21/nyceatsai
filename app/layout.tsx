import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NYC EatsAI",
  description: "Smart food discovery powered by AI — New York City eats made simple.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <body className={`${poppins.className} bg-slate-950 text-slate-100 antialiased min-h-screen`}>{children}
      </body>
    </html>
  );
}
