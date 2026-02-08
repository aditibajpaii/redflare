import Link from "next/link"

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background text-foreground px-4 sm:px-6 py-10">
            <div className="mx-auto w-full max-w-3xl space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
                    <p className="text-sm text-muted-foreground">Last updated: February 8, 2026</p>
                </div>

                <section className="space-y-3 text-sm leading-relaxed">
                    <h2 className="text-lg font-medium">1. Educational Tool Only</h2>
                    <p>
                        Red Flare is provided for educational and informational purposes only. It does not provide
                        investment advice, trading advice, or financial advisory services.
                    </p>
                </section>

                <section className="space-y-3 text-sm leading-relaxed">
                    <h2 className="text-lg font-medium">2. No Investment Recommendations</h2>
                    <p>
                        Nothing on Red Flare constitutes a recommendation to buy, sell, or hold any security. All
                        analysis is generated algorithmically and may be incomplete or inaccurate.
                    </p>
                </section>

                <section className="space-y-3 text-sm leading-relaxed">
                    <h2 className="text-lg font-medium">3. Consult Licensed Professionals</h2>
                    <p>
                        Red Flare is not registered with SEBI as an investment adviser. Before making any investment
                        decision, consult a SEBI-registered investment adviser or other licensed professional.
                    </p>
                </section>

                <section className="space-y-3 text-sm leading-relaxed">
                    <h2 className="text-lg font-medium">4. User Responsibility</h2>
                    <p>
                        You are solely responsible for your investment decisions and for evaluating any risks associated
                        with securities or financial products. Red Flare and its creators are not liable for losses.
                    </p>
                </section>

                <section className="space-y-3 text-sm leading-relaxed">
                    <h2 className="text-lg font-medium">5. Data Sources & Accuracy</h2>
                    <p>
                        Data may be delayed, incomplete, or unavailable. You must verify all information from official
                        sources before acting. This project is a non-commercial hackathon build and is not intended for
                        production use.
                    </p>
                </section>

                <section className="space-y-3 text-sm leading-relaxed">
                    <h2 className="text-lg font-medium">6. Age Requirement</h2>
                    <p>You must be at least 18 years old to use this service.</p>
                </section>

                <p className="text-xs text-muted-foreground">
                    By using Red Flare, you agree to these terms. Return to{" "}
                    <Link href="/" className="underline underline-offset-2 hover:text-foreground">
                        homepage
                    </Link>
                    .
                </p>
            </div>
        </main>
    )
}
