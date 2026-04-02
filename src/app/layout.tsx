import { Outfit, IBM_Plex_Mono, Inter, Noto_Serif, Audiowide } from "next/font/google";
import localFont from "next/font/local";
import type { Metadata } from "next";
import Script from "next/script";
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
const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-audiowide",
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
  title: {
    default: "Rive AI - Next Generation Creative Platform",
    template: "%s | Rive AI"
  },
  description: "The most powerful AI creative suite. Generate images, videos, 3D models, and high-quality speech in seconds with the power of Rive AI.",
  keywords: ["AI Art", "Video Generation", "3D AI", "Text to Speech", "AI Creativity", "Rive AI"],
  authors: [{ name: "Rive AI Team" }],
  openGraph: {
    title: "Rive AI - Your Creative Co-Pilot",
    description: "Generate professional-grade AI content across all mediums.",
    url: "https://rive-ai.com",
    siteName: "Rive AI",
    images: [
      {
        url: "/og-image.png", // Ensure this exists or provide a full URL
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rive AI - The Future of Content Creation",
    description: "Transform your ideas into 3D, Video, and Art with one click.",
    images: ["/og-image.png"],
  },
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
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${ibmPlexMono.variable} ${inter.variable} ${notoSerif.variable} ${audiowide.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,fr,es,de,it,ja,ko,zh-CN,ar',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script 
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" 
          strategy="afterInteractive" 
        />
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
          strategy="lazyOnload"
        />

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
