import YahooFinance from "yahoo-finance2"

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] })

export type StockQuote = {
    symbol: string
    name: string
    sector: string
    price: number
    priceChange: number
    priceChangePercent: number
    pe: number | null
    debtEquity: number | null
    marketCap: number
    dayHigh: number
    dayLow: number
    fiftyTwoWeekHigh: number
    fiftyTwoWeekLow: number
    volume: number
    currency: string
}

function toYahooSymbol(symbol: string): string {
    return symbol.toUpperCase()
}

export async function fetchQuote(symbol: string): Promise<StockQuote | null> {
    try {
        const yahooSymbol = toYahooSymbol(symbol)
        const quote = await yahooFinance.quote(yahooSymbol)

        if (!quote) return null

        return {
            symbol: symbol.replace(".NS", "").replace(".BO", ""),
            name: quote.shortName || quote.longName || symbol,
            sector: "",
            price: quote.regularMarketPrice || 0,
            priceChange: quote.regularMarketChange || 0,
            priceChangePercent: quote.regularMarketChangePercent || 0,
            pe: quote.trailingPE || null,
            debtEquity: null,
            marketCap: quote.marketCap || 0,
            dayHigh: quote.regularMarketDayHigh || 0,
            dayLow: quote.regularMarketDayLow || 0,
            fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
            volume: quote.regularMarketVolume || 0,
            currency: quote.currency || "INR",
        }
    } catch (error) {
        console.error(`Yahoo Finance error for ${symbol}:`, error)
        return null
    }
}

export async function fetchKeyStats(symbol: string): Promise<{ debtEquity: number | null }> {
    try {
        const yahooSymbol = toYahooSymbol(symbol)
        const stats = await yahooFinance.quoteSummary(yahooSymbol, { modules: ["financialData"] })
        return {
            debtEquity: stats.financialData?.debtToEquity ? stats.financialData.debtToEquity / 100 : null,
        }
    } catch {
        return { debtEquity: null }
    }
}

export async function fetchHistoricalPrices(
    symbol: string,
    period: "1d" | "5d" | "1mo" | "3mo" | "1y" | "ytd" = "1mo"
): Promise<{ date: string; price: number; volume: number }[]> {
    try {
        const yahooSymbol = toYahooSymbol(symbol)
        const endDate = new Date()
        const startDate = new Date()

        switch (period) {
            case "1d":
                startDate.setDate(endDate.getDate() - 1)
                break
            case "5d":
                startDate.setDate(endDate.getDate() - 5)
                break
            case "1mo":
                startDate.setMonth(endDate.getMonth() - 1)
                break
            case "3mo":
                startDate.setMonth(endDate.getMonth() - 3)
                break
            case "1y":
                startDate.setFullYear(endDate.getFullYear() - 1)
                break
            case "ytd":
                startDate.setMonth(0, 1)
                break
        }

        const history = await yahooFinance.chart(yahooSymbol, {
            period1: startDate.toISOString().split("T")[0],
            period2: endDate.toISOString().split("T")[0],
            interval: ["1d", "5d"].includes(period) ? "5m" : "1d",
        })

        if (!history?.quotes) return []

        return history.quotes.map((q) => ({
            date: new Date(q.date).toISOString().split("T")[0],
            price: q.close || 0,
            volume: q.volume || 0,
        }))
    } catch {
        return []
    }
}

export async function fetchStockData(symbol: string): Promise<StockQuote | null> {
    const quote = await fetchQuote(symbol)
    if (!quote) return null

    const stats = await fetchKeyStats(symbol)
    quote.debtEquity = stats.debtEquity

    return quote
}
