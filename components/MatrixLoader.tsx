"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type MatrixLoaderProps = {
    text?: string
    isLoading?: boolean
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&"

export function MatrixLoader({ text = "LOADING", isLoading = true }: MatrixLoaderProps) {
    const [displayText, setDisplayText] = useState("")
    const [phase, setPhase] = useState(0)

    useEffect(() => {
        if (!isLoading) return

        let frame = 0
        const targetText = text.toUpperCase()

        const interval = setInterval(() => {
            frame++
            const progress = Math.min(frame / 20, 1)
            const revealCount = Math.floor(progress * targetText.length)

            const newText = targetText
                .split("")
                .map((char, i) => {
                    if (i < revealCount) return char
                    if (char === " ") return " "
                    return characters[Math.floor(Math.random() * characters.length)]
                })
                .join("")

            setDisplayText(newText)

            if (frame >= 20) {
                frame = 0
                setPhase((p) => (p + 1) % 3)
            }
        }, 50)

        return () => clearInterval(interval)
    }, [text, isLoading])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
        >
            <div className="relative">
                <div className="font-pixel text-3xl tracking-[0.3em] text-brand-algolia">
                    {displayText}
                </div>

                <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 w-3 h-8 bg-brand-algolia"
                />
            </div>

            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            opacity: phase === i ? 1 : 0.3,
                            scale: phase === i ? 1.2 : 1,
                        }}
                        className={cn(
                            "w-2 h-2 rounded-full",
                            phase === i ? "bg-accent-growth" : "bg-muted"
                        )}
                    />
                ))}
            </div>

            <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                {phase === 0 && "Connecting to servers..."}
                {phase === 1 && "Processing data..."}
                {phase === 2 && "Generating analysis..."}
            </div>
        </motion.div>
    )
}
