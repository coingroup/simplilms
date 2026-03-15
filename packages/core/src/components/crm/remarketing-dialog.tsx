"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
} from "@simplilms/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@simplilms/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@simplilms/ui";
import { createBrowserClient } from "@simplilms/auth";
import { sendRemarketing } from "../../actions/remarketing";
import { toast } from "sonner";
import type { ProspectRow, CommunicationTemplateRow } from "../../lib/queries";
import type { CommunicationChannel } from "@simplilms/database";
import { Mail, Phone, MessageSquare, Send } from "lucide-react";

interface RemarketingDialogProps {
  prospect: ProspectRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemarketingDialog({
  prospect,
  open,
  onOpenChange,
}: RemarketingDialogProps) {
  const [channel, setChannel] = useState<CommunicationChannel>("email");
  const [templates, setTemplates] = useState<CommunicationTemplateRow[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, channel]);

  const fetchTemplates = async () => {
    const supabase = createBrowserClient();
    const { data } = await (supabase as any)
      .from("communication_templates")
      .select("*")
      .eq("channel", channel)
      .order("name");
    setTemplates((data || []) as CommunicationTemplateRow[]);
    setSelectedTemplateId("");
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const resolvePreview = (text: string | null) => {
    if (!text) return "";
    return text
      .replace(/\{\{first_name\}\}/g, prospect.first_name || "")
      .replace(/\{\{last_name\}\}/g, prospect.last_name || "")
      .replace(/\{\{program\}\}/g, prospect.program_interest || "")
      .replace(/\{\{payment_link\}\}/g, "[payment link]")
      .replace(/\{\{website_link\}\}/g, "[website link]");
  };

  const handleSend = () => {
    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }

    startTransition(async () => {
      const result = await sendRemarketing({
        prospectId: prospect.id,
        templateId: selectedTemplateId,
        channel,
      });

      if (result.success) {
        toast.success("Message sent successfully");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to send message");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Send Message to {prospect.first_name} {prospect.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Channel Selection */}
          <div className="space-y-2">
            <Label>Channel</Label>
            <Tabs
              value={channel}
              onValueChange={(v) => setChannel(v as CommunicationChannel)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="email" className="gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="sms" className="gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  SMS
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  WhatsApp
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Template</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    templates.length === 0
                      ? "No templates available"
                      : "Select a template"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {selectedTemplate && (
            <div className="space-y-2">
              <Label>Preview</Label>
              {selectedTemplate.subject && (
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Subject
                  </p>
                  <p className="text-sm font-medium">
                    {resolvePreview(selectedTemplate.subject)}
                  </p>
                </div>
              )}
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Body
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {resolvePreview(selectedTemplate.body)}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isPending || !selectedTemplateId}
          >
            <Send className="mr-1.5 h-4 w-4" />
            {isPending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
