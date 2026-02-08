import { NextRequest, NextResponse } from "next/server"
import { fetchStockData, fetchHistoricalPrices } from "@/lib/yahoo"
import { searchClient, INDICES, isAlgoliaConfigured } from "@/lib/algolia-client"

import benchmarks from "@/data/benchmarks.json"

export const dynamic = "force-dynamic"
export const revalidate = 60

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const includeHistory = searchParams.get("history") === "true"

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    try {
        const stockData = await fetchStockData(symbol)

        if (!stockData) {
            return NextResponse.json({ error: "Stock not found" }, { status: 404 })
        }

        type AlgoliaStock = { sector?: string; riskFactors?: string[]; marketCap?: number }
        let algoliaData: AlgoliaStock | null = null

        type SectorBenchmark = { avgPE: number; avgDebtEquity: number }
        let sectorBenchmark: SectorBenchmark | null = null

        if (isAlgoliaConfigured && searchClient) {
            try {
                const { results } = await searchClient.search({
                    requests: [
                        {
                            indexName: INDICES.STOCKS,
                            query: symbol.replace(".NS", ""),
                            hitsPerPage: 1,
                        },
                    ],
                })
                const searchResult = results[0]
                if ("hits" in searchResult && searchResult.hits.length > 0) {
                    algoliaData = searchResult.hits[0] as unknown as AlgoliaStock
                }
            } catch {
            }

            if (algoliaData?.sector) {
                try {
                    const { results } = await searchClient.search({
                        requests: [
                            {
                                indexName: INDICES.BENCHMARKS,
                                query: algoliaData.sector,
                                hitsPerPage: 1,
                            },
                        ],
                    })
                    const benchmarkResult = results[0]
                    if ("hits" in benchmarkResult && benchmarkResult.hits.length > 0) {
                        sectorBenchmark = benchmarkResult.hits[0] as unknown as SectorBenchmark
                    }
                } catch {
                }
            }
        }

        if (!sectorBenchmark && algoliaData?.sector) {
            const benchmarkArray = benchmarks as Array<{ sector: string; avgPE: number; avgDebtEquity: number; avgMargin: number }>
            const sectorData = benchmarkArray.find(b => b.sector === algoliaData.sector)
            if (sectorData) {
                sectorBenchmark = sectorData
            }
        }

        let history = null
        if (includeHistory) {
            history = await fetchHistoricalPrices(symbol, "1y")
        }

        return NextResponse.json({
            ...stockData,
            sector: algoliaData?.sector || stockData.sector,
            riskFactors: algoliaData?.riskFactors || [],
            sectorBenchmark,
            history,
        })
    } catch (error) {
        console.error("Stock API error:", error)
        return NextResponse.json(
            { error: "Failed to fetch stock data" },
            { status: 500 }
        )
    }
}
