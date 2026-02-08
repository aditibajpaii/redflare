import niftyStocks from "@/data/nifty_50.json"
import patterns from "@/data/patterns.json"

type Stock = {
    symbol: string
    name: string
    sector: string
    marketCap: number
    riskFactors: string[]
}

type Pattern = {
    id: string
    name: string
    description: string
    severity: string
    indicators: string[]
}

export function searchStocks(query: string): Stock[] {
    if (!query.trim()) return []

    const lowerQuery = query.toLowerCase()
    const stocks = niftyStocks as Stock[]

    const sectorMatches: Stock[] = []
    const nameMatches: Stock[] = []
    const riskMatches: Stock[] = []

    if (lowerQuery.includes("high debt") || lowerQuery.includes("debt")) {
        riskMatches.push(...stocks.filter((s) => s.riskFactors.some((rf) => rf.toLowerCase().includes("debt"))))
    }

    if (lowerQuery.includes("bank")) {
        sectorMatches.push(...stocks.filter((s) => s.sector.toLowerCase() === "banking"))
    }

    if (lowerQuery.includes("tech") || lowerQuery.includes("it")) {
        sectorMatches.push(...stocks.filter((s) => s.sector.toLowerCase() === "it"))
    }

    if (lowerQuery.includes("insider")) {
        riskMatches.push(...stocks.filter((s) => s.riskFactors.some((rf) => rf.toLowerCase().includes("governance") || rf.toLowerCase().includes("promoter"))))
    }

    nameMatches.push(
        ...stocks.filter(
            (s) => s.symbol.toLowerCase().includes(lowerQuery) || s.name.toLowerCase().includes(lowerQuery)
        )
    )

    const combined = [...new Set([...nameMatches, ...sectorMatches, ...riskMatches])]
    return combined.slice(0, 10)
}

export function findMatchingPatterns(divergences: string[]): Pattern[] {
    return (patterns as Pattern[]).filter((p) =>
        p.indicators.some((ind) => divergences.some((d) => d.toLowerCase().includes(ind.toLowerCase().split(" ")[0])))
    )
}
