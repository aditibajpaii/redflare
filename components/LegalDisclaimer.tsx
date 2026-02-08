import { AlertTriangle } from "lucide-react"

type LegalDisclaimerProps = {
    compact?: boolean
}

export function LegalDisclaimer({ compact = false }: LegalDisclaimerProps) {
    return (
        <div className="w-full rounded-xl border border-yellow-500/25 bg-yellow-500/7 p-3 sm:p-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-yellow-400" />
                <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
                    <p className="font-semibold text-yellow-300">
                        Educational Use Only. Not Financial Advice.
                    </p>
                    {compact ? (
                        <p className="text-yellow-100/85">
                            Research tool only. Consult a SEBI-registered adviser before investment decisions.
                        </p>
                    ) : (
                        <p className="text-yellow-100/90">
                            Red Flare is a research tool for educational and informational purposes. It does not provide
                            investment recommendations. Consult a SEBI-registered investment adviser before making any
                            investment decisions.
                        </p>
                    )}
                    {!compact ? (
                        <p className="text-yellow-100/80">
                            Data may be delayed or incomplete. Always verify from official sources.
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
