"use client"

import { Player } from "@remotion/player"
import { DivergenceReel } from "./remotion/DivergenceReel"
import { XClose, Copy01 } from "@untitledui/icons"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

type ShareModalProps = {
    isOpen: boolean
    onClose: () => void
    data: {
        symbol: string
        name: string
        price: number
        priceChange: number
        score: number
        verdict: string
        divergences: string[]
    }
}

export function ShareModal({ isOpen, onClose, data }: ShareModalProps) {
    const [copied, setCopied] = useState(false)
    const [copyFailed, setCopyFailed] = useState(false)

    const buildSharePayload = () => {
        const payload = {
            stock: {
                symbol: data.symbol,
                name: data.name,
                price: data.price,
                priceChange: data.priceChange,
            },
            score: data.score,
            verdict: data.verdict,
            divergences: data.divergences,
        }
        const json = JSON.stringify(payload)
        return encodeURIComponent(btoa(unescape(encodeURIComponent(json))))
    }

    const handleCopyLink = async () => {
        const origin = typeof window !== "undefined" ? window.location.origin : ""
        try {
            const encoded = buildSharePayload()
            await navigator.clipboard.writeText(`${origin}/share?data=${encoded}`)
            setCopied(true)
            setCopyFailed(false)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            setCopied(false)
            setCopyFailed(true)
            setTimeout(() => setCopyFailed(false), 2000)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card/20 border border-white/10 rounded-3xl overflow-hidden max-w-sm w-full relative shadow-2xl shadow-brand-algolia/10 backdrop-blur-xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm p-2 rounded-full text-white/70 hover:text-white transition-all border border-white/5"
                        >
                            <XClose className="w-5 h-5" />
                        </button>

                        <div className="aspect-[9/16] w-full bg-black relative">
                            <Player
                                component={DivergenceReel}
                                inputProps={{
                                    stock: {
                                        symbol: data.symbol,
                                        name: data.name,
                                        price: data.price,
                                        priceChange: data.priceChange,
                                    },
                                    score: data.score,
                                    verdict: data.verdict,
                                    divergences: data.divergences,
                                }}
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

                        <div className="p-6 border-t border-white/5 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center justify-center gap-2 mb-4 text-xs font-medium text-white/50 bg-white/5 py-1.5 px-3 rounded-full w-fit mx-auto border border-white/5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                Screen record to share
                            </div>

                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98]"
                            >
                                <Copy01 className="w-4 h-4" />
                                <span>{copied ? "Copied!" : copyFailed ? "Copy failed" : "Copy Public Link"}</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
