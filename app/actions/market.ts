"use server"

import YahooFinance from "yahoo-finance2"

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] })

export type MarketMover = {
    symbol: string
    shortName: string
    regularMarketPrice: number
    regularMarketChangePercent: number
    regularMarketVolume: number
}

export type MarketData = {
    trending: MarketMover[]
    topGainers: MarketMover[]
    topLosers: MarketMover[]
    mostActive: MarketMover[]
    indexData?: MarketMover | null
}

function buildTrending(gainers: YahooQuote[], losers: YahooQuote[]): MarketMover[] {
    const combined = [...gainers, ...losers]
    const sorted = combined
        .filter((q) => Boolean(q.symbol))
        .sort((a, b) => Math.abs(b.regularMarketChangePercent || 0) - Math.abs(a.regularMarketChangePercent || 0))

    const seen = new Set<string>()
    const trending: MarketMover[] = []

    for (const quote of sorted) {
        const symbol = quote.symbol || ""
        if (!symbol || seen.has(symbol)) continue
        seen.add(symbol)
        trending.push(mapQuote(quote))
        if (trending.length === 5) break
    }

    return trending
}

export async function getMarketMovers(): Promise<MarketData> {
    try {
        const queryOptions = { count: 5, region: 'IN', lang: 'en-IN' }
        const [gainersRes, losersRes, activeRes, indexRes] = await Promise.all([
            yahooFinance.screener({ ...queryOptions, scrIds: 'day_gainers' }),
            yahooFinance.screener({ ...queryOptions, scrIds: 'day_losers' }),
            yahooFinance.screener({ ...queryOptions, scrIds: 'most_actives' }),
            yahooFinance.quote("^NSEI")
        ])

        const gainersQuotes = (gainersRes as unknown as { quotes: YahooQuote[] }).quotes || []
        const losersQuotes = (losersRes as unknown as { quotes: YahooQuote[] }).quotes || []
        const activeQuotes = (activeRes as unknown as { quotes: YahooQuote[] }).quotes || []

        return {
            trending: buildTrending(gainersQuotes, losersQuotes),
            topGainers: gainersQuotes.slice(0, 5).map((q) => mapQuote(q)),
            topLosers: losersQuotes.slice(0, 5).map((q) => mapQuote(q)),
            mostActive: activeQuotes.slice(0, 5).map((q) => mapQuote(q)),
            indexData: indexRes ? mapQuote(indexRes as unknown as YahooQuote, "^NSEI") : null
        }
    } catch (e) {
        console.error("Failed to fetch market movers:", e)
        return { trending: [], topGainers: [], topLosers: [], mostActive: [] }
    }
}

interface YahooQuote {
    symbol?: string
    shortName?: string
    longName?: string
    regularMarketPrice?: number
    regularMarketChangePercent?: number
    regularMarketVolume?: number
}

function mapQuote(q: YahooQuote, fallbackSymbol = "UNKNOWN"): MarketMover {
    const symbol = q.symbol || fallbackSymbol
    return {
        symbol,
        shortName: q.shortName || q.longName || symbol,
        regularMarketPrice: q.regularMarketPrice || 0,
        regularMarketChangePercent: q.regularMarketChangePercent || 0,
        regularMarketVolume: q.regularMarketVolume || 0
    }
}
