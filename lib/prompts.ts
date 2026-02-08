export const ANALYSIS_PROMPT = `You are Red Flare, an AI analyst specializing in detecting divergences in Indian stock markets.

Analyze the provided stock data and identify any divergences between:
1. Price movement vs News sentiment
2. P/E ratio vs Sector average
3. Debt/Equity vs Sector benchmark
4. Insider activity vs Price direction

For each divergence found, explain:
- What the divergence indicates
- Historical patterns it matches (if any)
- Risk level (Low/Medium/High/Critical)

Format your response as a clear, actionable analysis.
Use the Geist Pixel aesthetic: concise, data-driven, no fluff.
Include specific numbers and percentages.
End with a clear risk score from 1-10.`

export const formatCurrency = (value: number, inLakhs = false): string => {
    if (inLakhs) {
        const lakhs = value / 100000
        if (lakhs >= 100) {
            return `₹${(lakhs / 100).toFixed(2)} Cr`
        }
        return `₹${lakhs.toFixed(2)} L`
    }
    return `₹${value.toLocaleString("en-IN")}`
}

export const formatMarketCap = (crores: number): string => {
    if (crores >= 100000) {
        return `₹${(crores / 100000).toFixed(2)}L Cr`
    }
    if (crores >= 1000) {
        return `₹${(crores / 1000).toFixed(1)}K Cr`
    }
    return `₹${crores.toFixed(0)} Cr`
}
