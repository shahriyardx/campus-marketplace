import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { Logo } from "@/components/logo"
import { SiteHeader } from "@/components/site-header"
import { TRPCProvider } from "@/trpc/client"
import "./globals.css"

// One family for the whole interface. globals.css points --font-sans,
// --font-display and --font-mono all at this variable, so the existing
// font-display / .numeric utilities keep working without touching every file.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    default: "Campus Marketplace",
    template: "%s · Campus Marketplace",
  },
  description:
    "Buy and sell used textbooks, calculators and study gear with other students on campus.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <TRPCProvider>
          <div className="flex min-h-dvh flex-col">
            {/* SiteHeader reads useSearchParams, which opts the tree out of
                prerendering unless it sits behind its own boundary. */}
            <Suspense
              fallback={<div className="h-16 border-b border-border" />}
            >
              <SiteHeader />
            </Suspense>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border">
              <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Logo showSubline={false} />
                  <span className="hidden sm:inline">
                    — student to student, no middleman.
                  </span>
                </div>
                <p className="label-caps">Payments happen in person</p>
              </div>
            </footer>
          </div>
          <Toaster position="top-center" />
        </TRPCProvider>
      </body>
    </html>
  )
}
