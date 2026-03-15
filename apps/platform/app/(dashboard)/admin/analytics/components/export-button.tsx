"use client";

import { useState, useTransition } from "react";
import { Button } from "@simplilms/ui";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
  exportAction: (type: string) => Promise<string>;
  type: string;
  label: string;
}

export function ExportButton({ exportAction, type, label }: ExportButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const csv = await exportAction(type);
      if (!csv) return;

      // Create and download CSV file
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}-analytics-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-1.5" />
      )}
      {label}
    </Button>
  );
}
