import { Outfit, IBM_Plex_Mono, Inter, Noto_Serif } from "next/font/google";
import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import MorphPanel from "@/components/ui/ai-input";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthLoaderProvider } from "@/components/AuthLoader";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Rive AI - Dashboard",
  description: "Next Generation AI SaaS",
  icons: {
    icon: "/minilogo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${ibmPlexMono.variable} ${inter.variable} ${notoSerif.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthLoaderProvider>
            {children}
            <MorphPanel />
            <Toaster theme="dark" position="bottom-right" />
          </AuthLoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
