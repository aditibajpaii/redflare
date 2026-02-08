import Link from "next/link"

export function LegalFooter() {
    return (
        <footer className="border-t border-border/60 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>© 2026 Red Flare</span>
                    <Link href="/legal/terms" className="underline underline-offset-2 hover:text-foreground">
                        Terms of Service
                    </Link>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Educational hackathon project. Not financial advice. Not for production use.
                </p>
            </div>
        </footer>
    )
}
