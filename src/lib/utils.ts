import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// globals.css adds the design-system type scale (`text-h1`, `text-body`, …).
// tailwind-merge doesn't know those names and would read them as text
// *colors*, so `cn("text-h1", "text-foreground")` would silently drop the size.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "body", "label", "small", "badge", "price", "stat", "price-lg"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
