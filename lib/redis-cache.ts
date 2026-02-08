import { Redis } from "@upstash/redis"

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null

export const isRedisConfigured = Boolean(redis)

const CACHE_TTL_SECONDS = 6 * 60 * 60

function getDateKey(): string {
    return new Date().toISOString().split("T")[0]
}

function getCacheKey(symbol: string): string {
    return `redflare:analysis:${symbol}:${getDateKey()}`
}

export interface CachedAnalysis {
    riskScore: number
    divergences: string[]
    patterns: string[]
    aiAnalysis: string
    cachedAt: number
}

export async function getCachedAnalysis(symbol: string): Promise<CachedAnalysis | null> {
    if (!redis) return null

    try {
        const cached = await redis.get<CachedAnalysis>(getCacheKey(symbol))
        if (cached) {
            console.log(`✅ Cache HIT for ${symbol}`)
            return cached
        }
        console.log(`❌ Cache MISS for ${symbol}`)
        return null
    } catch (error) {
        console.error("Redis get error:", error)
        return null
    }
}

export async function setCachedAnalysis(
    symbol: string,
    analysis: CachedAnalysis
): Promise<void> {
    if (!redis) return

    try {
        await redis.set(getCacheKey(symbol), analysis, { ex: CACHE_TTL_SECONDS })
        console.log(`💾 Cached analysis for ${symbol} (TTL: 6h)`)
    } catch (error) {
        console.error("Redis set error:", error)
    }
}

export async function clearCachedAnalysis(symbol: string): Promise<void> {
    if (!redis) return

    try {
        await redis.del(getCacheKey(symbol))
        console.log(`🗑️ Cleared cache for ${symbol}`)
    } catch (error) {
        console.error("Redis delete error:", error)
    }
}

export { redis }
