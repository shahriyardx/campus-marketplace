import { cn } from "@/lib/utils"

/**
 * An open C cradling a dot: the initial, and a cycle left deliberately
 * unclosed with the item sitting in the gap. Two shapes only, so it still
 * reads at favicon size.
 *
 * The arc is one path — a large counterclockwise sweep between two points on
 * the right-hand side, which is what leaves the mouth of the C open. The
 * stroke inherits currentColor so the mark takes the surrounding text colour
 * and needs no dark-mode variant; only the dot is pinned to the accent.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      role="img"
      aria-label="Campus Marketplace"
    >
      <path
        d="M23.07 7.57A11 11 0 1 0 23.07 24.43"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="24.6" cy="16" r="3.1" className="fill-primary" />
    </svg>
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
