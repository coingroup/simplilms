"use client";

import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { Input } from "@simplilms/ui";
import { Label } from "@simplilms/ui";
import { Textarea } from "@simplilms/ui";
import { Button } from "@simplilms/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Tenant"}
    </Button>
  );
}

export function TenantCreateForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action}>
      <div className="grid gap-6 max-w-2xl">
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
                placeholder="e.g., Acme Training Academy"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  name="contact_name"
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                name="domain"
                placeholder="portal.acmetraining.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supabase_project_url">Supabase Project URL</Label>
              <Input
                id="supabase_project_url"
                name="supabase_project_url"
                placeholder="https://xxxx.supabase.co"
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
                    defaultValue="#333333"
                    placeholder="#333333"
                    className="flex-1"
                  />
                  <input
                    type="color"
                    defaultValue="#333333"
                    className="h-10 w-10 rounded border border-gray-200 cursor-pointer"
                    onChange={(e) => {
                      const input = document.getElementById(
                        "primary_color"
                      ) as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary_color"
                    name="secondary_color"
                    defaultValue="#666666"
                    placeholder="#666666"
                    className="flex-1"
                  />
                  <input
                    type="color"
                    defaultValue="#666666"
                    className="h-10 w-10 rounded border border-gray-200 cursor-pointer"
                    onChange={(e) => {
                      const input = document.getElementById(
                        "secondary_color"
                      ) as HTMLInputElement;
                      if (input) input.value = e.target.value;
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                name="logo_url"
                placeholder="https://example.com/logo.png"
              />
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
                placeholder="Any additional notes about this tenant..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
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
