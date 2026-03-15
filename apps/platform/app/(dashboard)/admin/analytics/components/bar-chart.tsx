"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";

interface BarChartProps {
  title: string;
  data: { label: string; value: number }[];
  maxValue?: number;
  formatValue?: (v: number) => string;
  color?: string;
  icon?: React.ReactNode;
}

export function BarChart({
  title,
  data,
  maxValue,
  formatValue = (v) => String(v),
  color = "bg-primary",
  icon,
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate max-w-[60%]">
                  {item.label}
                </span>
                <span className="font-medium text-gray-900">
                  {formatValue(item.value)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-500`}
                  style={{
                    width: `${max > 0 ? (item.value / max) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No data available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
