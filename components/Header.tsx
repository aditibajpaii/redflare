import { Stars01 } from "@untitledui/icons"
import { Logo } from "@/components/Logo"

export function Header() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-border/40 supports-[backdrop-filter]:bg-background/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <Logo />

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-accent-growth/10 border border-accent-growth/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-growth opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-growth"></span>
                        </span>
                        <span className="text-[10px] font-mono text-accent-growth tracking-wide uppercase">System Online</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-algolia/10 border border-brand-algolia/20 transition-all hover:bg-brand-algolia/20">
                        <Stars01 className="w-3 h-3 text-brand-algolia" />
                        <span className="hidden sm:inline text-xs font-medium text-brand-algolia">Powered by Algolia</span>
                    </div>
                </div>
            </div>
        </nav>
    )
}
