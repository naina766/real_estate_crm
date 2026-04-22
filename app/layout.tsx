import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: { default: "RealCRM — Real Estate CRM", template: "%s | RealCRM" },
  description: "Production-ready Real Estate CRM — manage leads, properties, deals, and agents in one place.",
  keywords: ["real estate", "CRM", "property management", "leads", "deals"],
  authors: [{ name: "RealCRM" }],
  robots: "noindex",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a2035",
              color: "#f1f5ff",
              border: "1px solid #2a3356",
              borderRadius: "10px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#22d3a8", secondary: "#0f1117" } },
            error: { iconTheme: { primary: "#f04d5e", secondary: "#0f1117" } },
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
