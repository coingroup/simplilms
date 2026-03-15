"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@simplilms/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@simplilms/ui";
import { Separator } from "@simplilms/ui";
import { createBrowserClient } from "@simplilms/auth";
import { formatDateTime, formatPhone } from "../../lib/formatting";
import { ProspectNotes } from "./prospect-notes";
import { CommunicationLogTable } from "./communication-log-table";
import type { ProspectRow, CommunicationLogRow } from "../../lib/queries";
import { User, FileText, MessageSquare } from "lucide-react";

interface ProspectDetailDialogProps {
  prospect: ProspectRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProspectDetailDialog({
  prospect,
  open,
  onOpenChange,
}: ProspectDetailDialogProps) {
  const [communicationLog, setCommunicationLog] = useState<CommunicationLogRow[]>([]);

  useEffect(() => {
    if (prospect && open) {
      fetchCommunicationLog(prospect.id);
    }
  }, [prospect, open]);

  const fetchCommunicationLog = async (prospectId: string) => {
    const supabase = createBrowserClient();
    const { data } = await (supabase as any)
      .from("communication_log")
      .select("*")
      .eq("recipient_id", prospectId)
      .order("sent_at", { ascending: false });
    setCommunicationLog((data || []) as CommunicationLogRow[]);
  };

  if (!prospect) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {prospect.first_name} {prospect.last_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2">
          <TabsList>
            <TabsTrigger value="info" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              Info
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="communications" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Communications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Email" value={prospect.email} />
              <InfoField label="Phone" value={formatPhone(prospect.phone)} />
              <InfoField label="Program Interest" value={prospect.program_interest} />
              <InfoField label="Source" value={prospect.source} />
              <InfoField label="Inquiry Date" value={formatDateTime(prospect.inquiry_submitted_at)} />
              <InfoField label="Discovery Call" value={formatDateTime(prospect.discovery_call_date)} />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <InfoField label="IP Address" value={prospect.inquiry_ip_address} />
              <InfoField label="User Agent" value={prospect.inquiry_user_agent} mono />
            </div>

            {prospect.discovery_call_zoom_link && (
              <>
                <Separator />
                <InfoField label="Zoom Link" value={prospect.discovery_call_zoom_link} />
              </>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <ProspectNotes
              prospectId={prospect.id}
              notes={prospect.notes}
            />
          </TabsContent>

          <TabsContent value="communications" className="mt-4">
            <CommunicationLogTable logs={communicationLog} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function InfoField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm ${mono ? "font-mono text-xs break-all" : ""}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
