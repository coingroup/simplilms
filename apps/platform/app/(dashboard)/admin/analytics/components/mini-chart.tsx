"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";

interface MiniChartProps {
  title: string;
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  icon?: React.ReactNode;
  formatLabel?: (label: string) => string;
  subtitle?: string;
}

/**
 * A mini area/bar chart using pure CSS (no chart library dependency).
 * Renders vertical bars with hover tooltips.
 */
export function MiniChart({
  title,
  data,
  height = 120,
  color = "bg-primary/80",
  icon,
  formatLabel,
  subtitle,
}: MiniChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <span className="text-sm text-gray-500">{total} total</span>
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <div
          className="flex items-end gap-px"
          style={{ height }}
        >
          {data.map((item, i) => {
            const barHeight = max > 0 ? (item.value / max) * 100 : 0;
            const label = formatLabel
              ? formatLabel(item.label)
              : item.label;
            return (
              <div
                key={i}
                className="flex-1 group relative"
                style={{ height: "100%" }}
              >
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                  <div
                    className={`w-full ${color} rounded-t-sm transition-all duration-300 hover:opacity-80 min-h-[2px]`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    <div className="font-medium">{item.value}</div>
                    <div className="text-gray-300">{label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* X-axis labels (show first, middle, last) */}
        {data.length > 0 && (
          <div className="flex justify-between mt-1 text-[10px] text-gray-400">
            <span>
              {formatLabel
                ? formatLabel(data[0].label)
                : data[0].label}
            </span>
            {data.length > 2 && (
              <span>
                {formatLabel
                  ? formatLabel(data[Math.floor(data.length / 2)].label)
                  : data[Math.floor(data.length / 2)].label}
              </span>
            )}
            <span>
              {formatLabel
                ? formatLabel(data[data.length - 1].label)
                : data[data.length - 1].label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
