"use client"

import { useMemo } from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Player } from "@remotion/player"
import { DivergenceReel } from "@/components/remotion/DivergenceReel"

type SharePayload = {
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

function decodePayload(value: string | null): SharePayload | null {
    if (!value) return null
    try {
        const decoded = decodeURIComponent(value)
        const json = decodeURIComponent(escape(atob(decoded)))
        const parsed = JSON.parse(json) as SharePayload
        if (!parsed?.stock?.symbol) return null
        return parsed
    } catch {
        return null
    }
}

function SharePageContent() {
    const params = useSearchParams()
    const payload = useMemo(() => decodePayload(params.get("data")), [params])

    if (!payload) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-semibold">Invalid Share Link</h1>
                    <p className="mt-3 text-muted-foreground">
                        This shared reel link is invalid or expired.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-border bg-card/30 shadow-2xl">
                <div className="aspect-[9/16] w-full bg-black">
                    <Player
                        component={DivergenceReel}
                        inputProps={payload}
                        acknowledgeRemotionLicense
                        durationInFrames={150}
                        compositionWidth={1080}
                        compositionHeight={1920}
                        fps={30}
                        style={{ width: "100%", height: "100%" }}
                        controls
                        autoPlay
                        loop
                    />
                </div>
            </div>
        </div>
    )
}

export default function SharePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-semibold">Loading Share Link</h1>
                </div>
            </div>
        }>
            <SharePageContent />
        </Suspense>
    )
}
