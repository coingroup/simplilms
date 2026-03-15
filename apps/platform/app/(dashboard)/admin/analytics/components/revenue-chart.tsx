"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import type { RevenueByPeriod } from "@simplilms/core/actions/analytics";
import { DollarSign } from "lucide-react";

interface RevenueChartProps {
  data: RevenueByPeriod[];
  totalRevenueCents: number;
}

export function RevenueChart({ data, totalRevenueCents }: RevenueChartProps) {
  const max = Math.max(...data.map((d) => d.totalCents), 1);

  function formatMonth(period: string) {
    const [year, month] = period.split("-");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[parseInt(month, 10) - 1]} '${year.slice(2)}`;
  }

  function formatCurrency(cents: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue
          </CardTitle>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(totalRevenueCents)}
          </span>
        </div>
        <p className="text-xs text-gray-400">Last 12 months</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1" style={{ height: 140 }}>
          {data.map((item, i) => {
            const barHeight =
              max > 0 ? (item.totalCents / max) * 100 : 0;
            return (
              <div
                key={i}
                className="flex-1 group relative"
                style={{ height: "100%" }}
              >
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500/80 rounded-t-sm transition-all duration-300 hover:bg-green-600/80 min-h-[2px]"
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    <div className="font-medium">
                      {formatCurrency(item.totalCents)}
                    </div>
                    <div className="text-gray-300">
                      {item.transactionCount} transaction
                      {item.transactionCount !== 1 ? "s" : ""}
                    </div>
                    <div className="text-gray-400">
                      {formatMonth(item.period)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {data.length > 0 && (
          <div className="flex justify-between mt-1 text-[10px] text-gray-400">
            <span>{formatMonth(data[0].period)}</span>
            {data.length > 2 && (
              <span>
                {formatMonth(data[Math.floor(data.length / 2)].period)}
              </span>
            )}
            <span>{formatMonth(data[data.length - 1].period)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
