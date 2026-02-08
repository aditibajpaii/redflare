import { algoliasearch, SearchClient } from "algoliasearch"

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || ""
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ""
const adminKey = process.env.ALGOLIA_ADMIN_KEY || ""

export const isAlgoliaConfigured = Boolean(appId && searchKey)

let searchClient: SearchClient | null = null
if (isAlgoliaConfigured) {
    searchClient = algoliasearch(appId, searchKey)
}
export { searchClient }

export const adminClient = () => {
    if (!appId || !adminKey) {
        throw new Error("Algolia admin credentials not configured")
    }
    return algoliasearch(appId, adminKey)
}

export const INDICES = {
    STOCKS: "nifty_companies",
    PATTERNS: "divergence_patterns",
    SCANDALS: "sebi_scandals",
    BENCHMARKS: "sector_benchmarks",
}

export type Stock = {
    objectID?: string
    symbol: string
    name: string
    sector: string
    marketCap: number
    riskFactors: string[]
}

const NLP_RULES: Record<string, { filters?: string; boost?: string; keepInQuery?: boolean }> = {
    "high debt": { filters: 'riskFactors:"High Debt"' },
    "overvalued": { filters: 'riskFactors:"Overvalued"', boost: "pe_desc" },
    "undervalued": { filters: 'pe < 20', boost: "pe_asc" },
    "low pe": { filters: 'pe < 20', boost: "pe_asc" },
    "high pe": { filters: 'riskFactors:"Overvalued"', boost: "pe_desc" },
    "low margins": { filters: 'riskFactors:"Low Margins"' },
    "safe": { filters: 'riskFactors:"Low Debt" AND riskFactors:"Low Volatility"' },
    "risky": { filters: 'riskFactors:"High Debt" OR riskFactors:"High Beta"' },
    "high beta": { filters: 'riskFactors:"High Beta"' },
    "momentum": { filters: 'priceChangePercent > 20' },
    "penny": { filters: 'price < 50' },
    "dividend": { filters: 'riskFactors:"Dividend Payer"' },
    "defensive": { filters: 'sector:"FMCG" OR sector:"Pharma"' },
    "growth": { filters: 'pe > 30 AND riskFactors:"High Growth"' },
    "value": { filters: 'pe < 15' },
    "blue chip": { filters: 'marketCap > 1000000000000' },
    "midcap": { filters: 'marketCap < 500000000000 AND marketCap > 50000000000' },
    "banks": { filters: 'sector:"Banking"' },
    "banking": { filters: 'sector:"Banking"' },
    "finance": { filters: 'sector:"Finance" OR sector:"No. Banks"' },
    "fintech": { filters: 'sector:"New Age Tech"' },
    "tech": { filters: 'sector:"IT" OR sector:"New Age Tech"' },
    "it": { filters: 'sector:"IT"' },
    "software": { filters: 'sector:"IT"' },
    "pharma": { filters: 'sector:"Pharma"' },
    "healthcare": { filters: 'sector:"Healthcare"' },
    "auto": { filters: 'sector:"Automobile"' },
    "vehicles": { filters: 'sector:"Automobile"' },
    "ev": { filters: 'sector:"Automobile"' },
    "fmcg": { filters: 'sector:"FMCG"' },
    "consumer": { filters: 'sector:"FMCG" OR sector:"Consumer Goods"' },
    "metal": { filters: 'sector:"Metals"' },
    "steel": { filters: 'sector:"Metals"' },
    "oil": { filters: 'sector:"Oil & Gas"' },
    "energy": { filters: 'sector:"Oil & Gas" OR sector:"Power"' },
    "power": { filters: 'sector:"Power"' },
    "utility": { filters: 'sector:"Power"' },
    "defense": { filters: 'sector:"Defense"' },
    "defence": { filters: 'sector:"Defense"' },
    "aviation": { filters: 'sector:"Aviation"' },
    "airlines": { filters: 'sector:"Aviation"' },
    "telecom": { filters: 'sector:"Telecom"' },
    "infra": { filters: 'sector:"Infrastructure" OR sector:"Construction" OR sector:"Cement"' },
    "cement": { filters: 'sector:"Cement"' },
    "real estate": { filters: 'sector:"Real Estate"' },
    "realty": { filters: 'sector:"Real Estate"' },
    "retail": { filters: 'sector:"Retail"' },
    "insurance": { filters: 'sector:"Insurance"' },
    "adani": { keepInQuery: true },
    "tata": { keepInQuery: true },
    "reliance": { keepInQuery: true },
    "psu": { keepInQuery: true },
}

export function parseNLPQuery(query: string): {
    cleanQuery: string
    filters: string
} {
    const lowerQuery = query.toLowerCase()
    const appliedFilters: string[] = []
    let cleanQuery = query

    for (const [keyword, rule] of Object.entries(NLP_RULES)) {
        if (lowerQuery.includes(keyword)) {
            if (rule.filters) {
                appliedFilters.push(`(${rule.filters})`)
            }
            if (!rule.keepInQuery) {
                cleanQuery = cleanQuery.replace(new RegExp(keyword, "gi"), "").trim()
            }
        }
    }

    return {
        cleanQuery: cleanQuery || "*",
        filters: appliedFilters.join(" AND "),
    }
}

export async function searchStocks(query: string): Promise<Stock[]> {
    if (!searchClient) return []

    const { cleanQuery, filters } = parseNLPQuery(query)

    try {
        const { results } = await searchClient.search({
            requests: [
                {
                    indexName: INDICES.STOCKS,
                    query: cleanQuery === "*" ? "" : cleanQuery,
                    filters: filters || undefined,
                    hitsPerPage: 10,
                },
            ],
        })

        const searchResult = results[0]
        if ("hits" in searchResult) {
            return searchResult.hits as unknown as Stock[]
        }
        return []
    } catch {
        return []
    }
}

export async function findPatterns(indicators: string[]): Promise<{ name: string; description: string }[]> {
    if (!searchClient) return []

    try {
        const { results } = await searchClient.search({
            requests: [
                {
                    indexName: INDICES.PATTERNS,
                    query: indicators.join(" "),
                    hitsPerPage: 5,
                },
            ],
        })

        const searchResult = results[0]
        if ("hits" in searchResult) {
            return searchResult.hits as unknown as { name: string; description: string }[]
        }
        return []
    } catch {
        return []
    }
}
