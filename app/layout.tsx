import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "./components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Powered Job Matching | easy2apply",
  description:
    "Get matched with your dream job using AI. Upload your CV, discover perfect matches, and apply with one click.",
  keywords: [
    "job matching",
    "AI job search",
    "career matching",
    "bulk apply",
    "job applications",
    "CV score",
    "ATS checker",
    "resume score",
    "job search",
  ],
  authors: [{ name: "easy2apply" }],
  openGraph: {
    type: "website",
    title: "AI-Powered Job Matching | easy2apply",
    description:
      "Get matched with your dream job using AI. Upload your CV, discover perfect matches, and apply with one click.",
    siteName: "easy2apply",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered Job Matching | easy2apply",
    description:
      "Get matched with your dream job using AI. Upload your CV, discover perfect matches, and apply with one click.",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
