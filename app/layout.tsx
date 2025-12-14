import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./convex-client-provider";
import { AuthWrapper } from "@/components/AuthWrapper";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"]
});
const notoSans = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "600"]
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "English Mastery",
  description: "Master English with AI-Powered Precision",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${notoSans.variable} font-sans bg-[#050505] text-[#e4e4e7] antialiased`}>
      <ConvexClientProvider>
          <AuthWrapper>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
            {children}
            </ThemeProvider>
            </AuthWrapper>
      </ConvexClientProvider>
      </body>
    </html>
  );
}
