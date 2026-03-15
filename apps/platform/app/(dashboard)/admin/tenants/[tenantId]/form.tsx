"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { Input } from "@simplilms/ui";
import { Label } from "@simplilms/ui";
import { Textarea } from "@simplilms/ui";
import { Button } from "@simplilms/ui";
import type { WhitelabelTenantRow } from "@simplilms/core/actions/tenants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

const STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
  {
    value: "suspended",
    label: "Suspended",
    color: "bg-red-100 text-red-800",
  },
  {
    value: "provisioning",
    label: "Provisioning",
    color: "bg-yellow-100 text-yellow-800",
  },
];

export function TenantEditForm({
  tenant,
  action,
}: {
  tenant: WhitelabelTenantRow;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}) {
  const [status, setStatus] = useState(tenant.status);
  const [primaryColor, setPrimaryColor] = useState(tenant.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(tenant.secondary_color);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    const result = await action(formData);
    if (result.success) {
      setMessage({ type: "success", text: "Tenant updated successfully." });
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to update tenant.",
      });
    }
  }

  return (
    <form action={handleSubmit}>
      <div className="grid gap-6 max-w-2xl">
        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="status">Tenant Status</Label>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value as typeof status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      status === option.value
                        ? option.color + " border-current"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <input type="hidden" name="status" value={status} />
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tenant Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={tenant.name}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  name="contact_name"
                  defaultValue={tenant.contact_name || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  defaultValue={tenant.contact_email || ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                name="domain"
                defaultValue={tenant.domain || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supabase_project_url">Supabase Project URL</Label>
              <Input
                id="supabase_project_url"
                name="supabase_project_url"
                defaultValue={tenant.supabase_project_url || ""}
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary_color"
                    name="primary_color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={primaryColor}
                    className="h-10 w-10 rounded border border-gray-200 cursor-pointer"
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary_color"
                    name="secondary_color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={secondaryColor}
                    className="h-10 w-10 rounded border border-gray-200 cursor-pointer"
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                name="logo_url"
                defaultValue={tenant.logo_url || ""}
              />
            </div>

            {/* Color Preview */}
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-2">Color Preview</p>
              <div className="flex gap-3">
                <div
                  className="h-10 w-20 rounded border border-gray-200"
                  style={{ backgroundColor: primaryColor }}
                />
                <div
                  className="h-10 w-20 rounded border border-gray-200"
                  style={{ backgroundColor: secondaryColor }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={tenant.notes || ""}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feedback & Actions */}
        {message && (
          <div
            className={`rounded-md px-4 py-3 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex items-center gap-3">
          <SubmitButton />
          <a
            href="/admin/tenants"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </a>
        </div>
      </div>
    </form>
  );
}
