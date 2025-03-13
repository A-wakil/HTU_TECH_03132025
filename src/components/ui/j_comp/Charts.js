"use client"

import * as React from "react"
import { ResponsiveContainer, Tooltip } from "recharts"

export function ChartContainer({
  children,
  config,
  className,
}) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export function ChartTooltip({
  active,
  payload,
  label,
  hideLabel = false,
  indicator = "dot",
}) {
  if (!active || !payload) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && <div className="text-sm font-medium">{label}</div>}
      <div className="flex flex-col gap-0.5">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {indicator === "dot" && (
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            )}
            {indicator === "line" && (
              <div
                className="h-0.5 w-4"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-sm font-medium tabular-nums">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartTooltipContent(props) {
  return <ChartTooltip {...props} />
}

export const ChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
}