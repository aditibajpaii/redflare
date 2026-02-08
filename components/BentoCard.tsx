"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const BentoCard = ({ title, icon: Icon, children, className = "" }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("bg-card border border-border/50 p-5 rounded-xl flex flex-col", className)}
    >
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex-1">{children}</div>
    </motion.div>
)
