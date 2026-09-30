import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompareProvider } from "@/contexts/CompareContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default:  "ShikaGari — Find Your Perfect Car in Kenya",
    template: "%s | ShikaGari",
  },
  description:
    "Kenya's trusted car marketplace. Browse thousands of verified car listings from dealers and private sellers across Nairobi, Mombasa, Kisumu and beyond.",
  keywords: ["cars Kenya", "buy car Kenya", "Nairobi cars", "used cars Kenya"],
  openGraph: {
    title:       "ShikaGari — Find Your Perfect Car in Kenya",
    description: "Browse verified car listings across Kenya.",
    locale:      "en_KE",
    type:        "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
        <CompareProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: "DM Sans, sans-serif",
                fontSize:   "14px",
                fontWeight: "500",
                borderRadius: "12px",
                boxShadow: "0 4px 24px rgb(0 0 0 / 0.12)",
              },
              success: { iconTheme: { primary: "#2563eb", secondary: "#fff" } },
            }}
          />

          {/* Global navigation */}
          <Navbar />

          {/* Page content — offset by navbar height */}
          <main className="min-h-screen pt-[var(--nav-height)]">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </CompareProvider>
        </AuthProvider>
      </body>
    </html>
  );
}