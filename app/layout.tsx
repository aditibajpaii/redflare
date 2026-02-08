import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, VT323 } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
})

const pixelFont = VT323({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-pixel",
})

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://redflare.vercel.app"),
    title: "Red Flare | Divergence Detection for Indian Stock Markets",
    description: "AI-powered divergence detection platform for NIFTY 50 stocks. Analyze price-sentiment divergences, insider activity, and sector anomalies with Algolia-powered search.",
    keywords: ["stock analysis", "divergence detection", "NIFTY 50", "Indian markets", "AI trading"],
    openGraph: {
        title: "Red Flare | AI Stock Analysis",
        description: "Detect market anomalies and risk divergences in NIFTY 50 stocks.",
        images: ["/og-image.png"],
        type: "website",
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} ${pixelFont.variable} font-sans`}>
                {children}
            </body>
        </html>
    )
}
