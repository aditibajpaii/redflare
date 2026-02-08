"use client"

import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion"

type DivergenceReelProps = {
    stock: {
        symbol: string
        name: string
        price: number
        priceChange: number
    }
    score: number
    verdict: string
    divergences: string[]
}

export const DivergenceReel = ({ stock, score, verdict, divergences }: DivergenceReelProps) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()

    const isCritical = score >= 8
    const isWarning = score >= 5
    const riskColor = isCritical ? "#ff0000" : isWarning ? "#ffaa00" : "#00ff88"
    const riskLabel = isCritical ? "CRITICAL RISK" : isWarning ? "MODERATE RISK" : "LOW RISK"
    const bgRotation = frame * 2
    const pulse = Math.sin(frame / 5) * 0.05 + 1
    const glitchX = Math.random() * 10 * (Math.random() > 0.8 ? 1 : 0)
    const glitchY = Math.random() * 5 * (Math.random() > 0.8 ? 1 : 0)
    const slideUp = spring({ frame, fps, from: 200, to: 0, config: { damping: 12, mass: 0.5 } })
    const opacity = interpolate(frame, [0, 15], [0, 1])

    return (
        <AbsoluteFill className="bg-black text-white font-sans overflow-hidden">
            <AbsoluteFill style={{
                background: `conic-gradient(from ${bgRotation}deg at 50% 50%, #000000 0deg, #111111 120deg, ${riskColor}20 180deg, #111111 240deg, #000000 360deg)`,
                transform: "scale(1.5)",
                zIndex: 0
            }} />
            <AbsoluteFill style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
                opacity: 0.3,
                zIndex: 1,
                mixBlendMode: "overlay"
            }} />
            <AbsoluteFill style={{
                background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 50%)",
                backgroundSize: "100% 4px",
                zIndex: 2,
                pointerEvents: "none",
                opacity: 0.2
            }} />

            <AbsoluteFill style={{ padding: "60px 40px", zIndex: 10, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity, transform: `translateY(${slideUp * 0.2}px)` }}>
                    <div style={{ padding: "8px 16px", background: "#ffffff", color: "#000", fontWeight: 900, letterSpacing: "-0.05em", transform: "skew(-10deg)" }}>
                        STOCK SENTINEL
                    </div>
                    <span style={{ fontSize: 16, fontFamily: "monospace", color: "#fff", textShadow: "0 0 10px white" }}>REC • {new Date().toLocaleTimeString()}</span>
                </div>

                <Sequence from={5}>
                    <div style={{ marginTop: 80, position: "relative" }}>
                        <h1 style={{
                            fontSize: 140, fontWeight: 900, lineHeight: 0.8, letterSpacing: "-0.08em", margin: 0,
                            position: "absolute", top: glitchY, left: -5 + glitchX, color: "cyan", opacity: 0.7, mixBlendMode: "screen"
                        }}>{stock.symbol}</h1>
                        <h1 style={{
                            fontSize: 140, fontWeight: 900, lineHeight: 0.8, letterSpacing: "-0.08em", margin: 0,
                            position: "absolute", top: -glitchY, left: 5 - glitchX, color: "red", opacity: 0.7, mixBlendMode: "screen"
                        }}>{stock.symbol}</h1>

                        <h1 style={{ fontSize: 140, fontWeight: 900, lineHeight: 0.8, letterSpacing: "-0.08em", margin: 0, position: "relative", color: "#fff" }}>
                            {stock.symbol}
                        </h1>

                        <div style={{ fontSize: 32, fontWeight: 700, color: riskColor, marginTop: 10, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                            {stock.name.toUpperCase()}
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 40 }}>
                        <span style={{ fontSize: 64, fontWeight: 700, fontFamily: "monospace" }}>₹{stock.price.toLocaleString("en-IN")}</span>
                        <span style={{
                            fontSize: 32, fontWeight: 900,
                            color: stock.priceChange >= 0 ? "#00ff88" : "#ff0000",
                            border: `2px solid ${stock.priceChange >= 0 ? "#00ff88" : "#ff0000"}`,
                            padding: "4px 16px",
                            transform: "skew(-10deg)"
                        }}>
                            {stock.priceChange >= 0 ? "+" : ""}{stock.priceChange.toFixed(2)}%
                        </span>
                    </div>
                </Sequence>

                <Sequence from={25}>
                    <div style={{
                        marginTop: 60, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        transform: `scale(${pulse})`
                    }}>
                        <div style={{
                            width: 300, height: 300,
                            borderRadius: "50%",
                            border: `20px solid ${riskColor}30`,
                            borderTop: `20px solid ${riskColor}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 0 100px ${riskColor}40`,
                            transform: `rotate(${frame}deg)`
                        }}>
                            <div style={{
                                width: 240, height: 240, borderRadius: "50%", background: "#000",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transform: `rotate(-${frame}deg)`
                            }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 100, fontWeight: 900, lineHeight: 1, color: "white" }}>{score.toFixed(1)}</div>
                                    <div style={{ fontSize: 20, color: riskColor, fontWeight: 700 }}>RISK SCORE</div>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            fontSize: 42, fontWeight: 900, color: "#000",
                            background: riskColor, padding: "10px 40px",
                            marginTop: -40, zIndex: 20, transform: "skew(-10deg)",
                            boxShadow: `10px 10px 0px rgba(255,255,255,0.2)`
                        }}>
                            {riskLabel}
                        </div>
                    </div>
                </Sequence>

                <Sequence from={45}>
                    <div style={{ marginTop: 20 }}>
                        {divergences.slice(0, 2).map((d, i) => (
                            <div key={i} style={{
                                background: "#111", border: `1px solid ${riskColor}`,
                                padding: "20px", marginBottom: 10,
                                color: "#fff", fontSize: 20, fontWeight: 600,
                                transform: `translateX(${interpolate(frame, [45 + i * 5, 60 + i * 5], [-1000, 0])}px)`
                            }}>
                                ⚠️ {d.toUpperCase()}
                            </div>
                        ))}
                    </div>
                </Sequence>
            </AbsoluteFill>
        </AbsoluteFill>
    )
}
