import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DraftProvider } from "@/lib/draft-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ドラフトアプリ",
  description: "プロ野球ドラフト会議風チームメンバー編成アプリ",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DraftProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </DraftProvider>
      </body>
    </html>
  );
};

export default RootLayout;
