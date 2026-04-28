import * as React from "react"

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
 children: React.ReactNode
}

/**
 * Visually hidden component for screen reader only content
 * Based on Radix UI's VisuallyHidden primitive
 */
export const VisuallyHidden = React.forwardRef<
 HTMLSpanElement,
 VisuallyHiddenProps
>(({ children, ...props }, ref) => (
 <span
  ref={ref}
  style={{
   position: "absolute",
   width: "1px",
   height: "1px",
   padding: 0,
   margin: "-1px",
   overflow: "hidden",
   clip: "rect(0, 0, 0, 0)",
   whiteSpace: "nowrap",
   borderWidth: 0,
  }}
  {...props}
 >
  {children}
 </span>
))

VisuallyHidden.displayName = "VisuallyHidden"
