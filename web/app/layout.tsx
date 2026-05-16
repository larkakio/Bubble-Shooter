import type { Metadata } from "next";
import { JetBrains_Mono, Orbitron } from "next/font/google";
import { Providers } from "@/components/Providers";
import { CyberBackground } from "@/components/CyberBackground";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? "6a08284f4c3f57496e8396af";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bubble-shooter-ashy.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Neon Bubble Shooter",
  description:
    "Cyberpunk bubble shooter on Base. Swipe to aim, clear neon sectors, daily on-chain sync.",
  icons: { icon: "/app-icon.jpg", apple: "/app-icon.jpg" },
  openGraph: {
    title: "Neon Bubble Shooter",
    description: "Swipe. Pop. Sync on Base.",
    images: [{ url: "/app-thumbnail.jpg", width: 1200, height: 628 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${jetbrains.variable} h-full`}
    >
      <head>
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body className="h-full overflow-x-hidden bg-[#050508] text-white antialiased">
        <Providers>
          <CyberBackground />
          {children}
        </Providers>
      </body>
    </html>
  );
}
