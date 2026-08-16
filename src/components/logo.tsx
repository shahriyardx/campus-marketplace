import { cn } from "@/lib/utils"

/**
 * Ink tile holding a C set in the page's own display face. Drawn with type
 * rather than an SVG glyph so the mark inherits the brand's typography instead
 * of sitting beside it, and so it flips for dark mode on its own (the
 * foreground/background pair swaps).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-[0.3rem] bg-foreground",
        className,
      )}
    >
      <span className="font-display text-[1.25em] leading-none text-background">
        C
      </span>
    </span>
  )
}

export function Logo({
  className,
  showSubline = true,
}: {
  className?: string
  showSubline?: boolean
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="leading-none">
        <span className="block font-display text-xl leading-none">
          Campus<span className="text-primary">.</span>
        </span>
        {showSubline ? (
          <span className="label-caps mt-1 block text-[0.5625rem] text-muted-foreground">
            Marketplace
          </span>
        ) : null}
      </span>
    </span>
  )
}
