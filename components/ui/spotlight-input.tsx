"use client"

import { useState, useRef, useEffect, forwardRef } from "react"
import { motion } from "framer-motion"
import { Search, Command } from "lucide-react"
import { cn } from "@/lib/utils"

type SpotlightInputProps = {
    value: string
    onChange: (value: string) => void
    onFocus?: () => void
    onBlur?: () => void
    onKeyDown?: (e: React.KeyboardEvent) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    showShortcut?: boolean
}

export const SpotlightInput = forwardRef<HTMLInputElement, SpotlightInputProps>(
    function SpotlightInput(
        {
            value,
            onChange,
            onFocus,
            onBlur,
            onKeyDown,
            placeholder = "Search...",
            disabled = false,
            className,
            showShortcut = true,
        },
        ref
    ) {
        const [isFocused, setIsFocused] = useState(false)
        const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
        const containerRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const handleMouseMove = (e: MouseEvent) => {
                if (!containerRef.current) return
                const rect = containerRef.current.getBoundingClientRect()
                setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                })
            }

            const container = containerRef.current
            if (container) {
                container.addEventListener("mousemove", handleMouseMove)
                return () => container.removeEventListener("mousemove", handleMouseMove)
            }
        }, [])

        return (
            <motion.div
                ref={containerRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("relative group", className)}
            >

                <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(84, 104, 255, 0.1), transparent 40%)`,
                    }}
                />


                <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                        boxShadow: isFocused
                            ? "0 0 20px rgba(84, 104, 255, 0.3), inset 0 0 0 1px rgba(84, 104, 255, 0.5)"
                            : "inset 0 0 0 1px rgba(42, 47, 62, 1)",
                    }}
                    transition={{ duration: 0.2 }}
                />


                <div className="relative flex items-center">
                    <Search className="absolute left-5 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />

                    <input
                        ref={ref}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => {
                            setIsFocused(true)
                            onFocus?.()
                        }}
                        onBlur={() => {
                            setIsFocused(false)
                            onBlur?.()
                        }}
                        onKeyDown={onKeyDown}
                        disabled={disabled}
                        placeholder={placeholder}
                        className={cn(
                            "w-full h-16 pl-14 pr-24 bg-card/50 backdrop-blur-sm rounded-2xl",
                            "text-foreground text-lg font-sans",
                            "placeholder:text-muted-foreground",
                            "focus:outline-none",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "transition-all duration-200"
                        )}
                    />

                    {showShortcut && !value && (
                        <div className="absolute right-5 flex items-center gap-1 text-muted-foreground text-sm">
                            <kbd className="px-2 py-1 rounded-md bg-muted/50 border border-border text-xs font-mono flex items-center gap-1">
                                <Command className="w-3 h-3" />K
                            </kbd>
                        </div>
                    )}
                </div>
            </motion.div>
        )
    }
)
