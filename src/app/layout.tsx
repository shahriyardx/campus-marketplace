import type { Metadata } from "next"
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Instrument_Serif,
} from "next/font/google"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { SiteHeader } from "@/components/site-header"
import { TRPCProvider } from "@/trpc/client"
import "./globals.css"

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
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
      <body
        className={`${plexSans.variable} ${plexMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <TRPCProvider>
          <div className="flex min-h-dvh flex-col">
            {/* SiteHeader reads useSearchParams, which opts the tree out of
                prerendering unless it sits behind its own boundary. */}
            <Suspense fallback={<div className="h-16 border-b border-border" />}>
              <SiteHeader />
            </Suspense>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border">
              <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>
                  <span className="font-display text-base text-foreground">
                    Campus Marketplace
                  </span>{" "}
                  — student to student, no middleman.
                </p>
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
