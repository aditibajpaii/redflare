import { NextRequest, NextResponse } from "next/server"

const POSITIVE_WORDS = ["surge", "jump", "gain", "profit", "growth", "rise", "bullish", "strong", "soar", "rally", "record", "high", "beat", "exceed", "upgrade", "buy", "outperform"]
const NEGATIVE_WORDS = ["fall", "drop", "loss", "crash", "plunge", "bearish", "weak", "decline", "low", "miss", "downgrade", "sell", "underperform", "concern", "warning", "risk", "fraud", "scandal", "investigation"]

function analyzeSentiment(text: string): number {
    const lower = text.toLowerCase()
    let score = 0

    for (const word of POSITIVE_WORDS) {
        if (lower.includes(word)) score += 1
    }
    for (const word of NEGATIVE_WORDS) {
        if (lower.includes(word)) score -= 1
    }

    return Math.max(-1, Math.min(1, score / 3))
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const companyName = searchParams.get("name")

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    try {
        const query = encodeURIComponent(`${companyName || symbol} stock India`)
        const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`

        const response = await fetch(rssUrl, {
            headers: { "User-Agent": "RedFlare/1.0" },
            next: { revalidate: 300 },
        })

        if (!response.ok) {
            throw new Error("Failed to fetch news")
        }

        const xml = await response.text()
        const items: { title: string; link: string; pubDate: string; sentiment: number }[] = []

        const itemRegex = /<item>([\s\S]*?)<\/item>/g
        let match

        while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
            const itemXml = match[1]

            const titleMatch = /<title>(.*?)<\/title>/.exec(itemXml)
            const linkMatch = /<link>(.*?)<\/link>/.exec(itemXml)
            const dateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemXml)

            if (titleMatch) {
                const title = titleMatch[1]
                    .replace(/<!\[CDATA\[/g, "")
                    .replace(/\]\]>/g, "")
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&quot;/g, '"')

                items.push({
                    title,
                    link: linkMatch?.[1] || "",
                    pubDate: dateMatch?.[1] || "",
                    sentiment: analyzeSentiment(title),
                })
            }
        }

        const avgSentiment = items.length > 0
            ? items.reduce((sum, item) => sum + item.sentiment, 0) / items.length
            : 0

        return NextResponse.json({
            news: items.map((item) => ({
                title: item.title,
                sentiment: item.sentiment,
                date: item.pubDate,
            })),
            avgSentiment,
            count: items.length,
        })
    } catch {
        return NextResponse.json({
            news: [],
            avgSentiment: 0,
            count: 0,
        })
    }
}
