"use client";

import { Card, CardContent } from "@simplilms/ui";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  subtitle?: string;
  trend?: { value: number; label: string };
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  subtitle,
  trend,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div
              className={`text-xs font-medium ${
                trend.value >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <span>
                {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <p className="text-gray-400 font-normal">{trend.label}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
