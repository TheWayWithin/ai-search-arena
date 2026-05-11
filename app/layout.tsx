import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Search Arena - Independent AI Search Tool Benchmarks",
    template: "%s | AI Search Arena",
  },
  description:
    "Monthly independent benchmarks evaluating 27+ AI search optimization (GEO/AEO) tools against 50+ standardized metrics using 6-model AI consensus methodology.",
  metadataBase: new URL("https://aisearcharena.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AI Search Arena",
    title: "AI Search Arena - Independent AI SEO Tool Rankings",
    description:
      "Weekly benchmark cycles evaluating 32 AI SEO tools across 51 dimensions with 6 independent AI judges. See current rankings.",
    url: "https://aisearcharena.com",
    images: [
      {
        url: "https://aisearcharena.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Search Arena - Top Evaluated Tools leaderboard showing BrightEdge, Semrush, Conductor, seoClarity rankings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Search Arena - Independent AI SEO Tool Rankings",
    description: "Weekly benchmark cycles evaluating 32 AI SEO tools. See current rankings.",
    images: ["https://aisearcharena.com/og-image.png"],
  },
  alternates: {
    canonical: "https://aisearcharena.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL && (
          <>
            <script async src={process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`,
              }}
            />
          </>
        )}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
