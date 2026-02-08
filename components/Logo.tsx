import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
    return (
        <Link href="/" className={cn("flex items-center gap-2 group", className)}>
            <div className="relative flex items-center justify-center w-8 h-8 rounded bg-brand-algolia/10 border border-brand-algolia/20 group-hover:bg-brand-algolia/20 transition-colors">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-brand-algolia"
                >
                    <path
                        d="M2 9V6.5C2 4.01 4.01 2 6.5 2H9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M15 2H17.5C19.99 2 22 4.01 22 6.5V9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M22 15V17.5C22 19.99 19.99 22 17.5 22H15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M9 22H6.5C4.01 22 2 19.99 2 17.5V15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 12M12 8V16M8 12H16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            <div>
                <span className="font-pixel text-xl tracking-wide text-foreground group-hover:text-brand-algolia transition-colors">
                    RED_FLARE
                </span>
            </div>
        </Link>
    )
}
