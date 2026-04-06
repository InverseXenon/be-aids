import { Space_Grotesk, Inter, Caveat } from "next/font/google";
import "./globals.css";
import KonamiCode from "@/components/shared/KonamiCode";
import LofiPlayer from "@/components/shared/LofiPlayer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-playfair", // repurposing the variable to avoid heavy CSS refactoring of classes
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-lato", // repurposing variable
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata = {
  title: "Batch '26 | VESIT Memorial & Yearbook",
  description:
    "A digital yearbook and memorial for the Batch '26 from Vivekanand Education Society's Institute of Technology (VESIT), Mumbai. Four years. One family. Forever.",
  keywords: ["VESIT", "Yearbook", "Mumbai", "Batch 26", "Engineering", "Hall of Fame"],
  openGraph: {
    title: "Batch '26 | VESIT Yearbook",
    description: "Four years. One family. Forever.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFBF7" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* DNS prefetch + preconnect for Cloudinary — faster image loads */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-parchment text-foreground" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="texture-overlay" />
          <KonamiCode />
          <LofiPlayer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
