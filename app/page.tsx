"use client"

import { useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

import { StockOmnibar } from "@/components/StockOmnibar"
import { BentoGrid } from "@/components/BentoGrid"
import { Header } from "@/components/Header"



export default function Page() {
    const router = useRouter()


    const handleSelectStock = useCallback((symbol: string) => {
        router.push(`/stock/${symbol}`)
    }, [router])



    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent-growth selection:text-white overflow-x-hidden">
            <Header />

            <main className="pt-24 pb-16 px-4 sm:px-6 relative min-h-screen flex flex-col items-center justify-center">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] z-0" />

                <div className="max-w-7xl mx-auto relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl sm:text-7xl font-medium tracking-tight mb-6 text-foreground">
                            Spot Institutional <br className="hidden sm:block" />
                            <span className="text-accent-growth">Anomalies</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
                            Real-time anomaly detection across NIFTY 50 & NASDAQ 100. <br />
                            Signal-to-noise ratio: <span className="text-foreground font-mono">99%</span>.
                        </p>
                    </motion.div>

                    <div className="mb-16 max-w-2xl mx-auto">
                        <StockOmnibar onSelectStock={handleSelectStock} isAnalyzing={false} />
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8"
                    >
                        <BentoGrid />
                    </motion.div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 py-4 text-center bg-background/60 backdrop-blur-xl border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                    © 2026 Red Flare. All rights reserved.
                </p>
            </footer>
        </div>
    )
}
