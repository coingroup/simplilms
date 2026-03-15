import { requireRole } from "@simplilms/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { Settings, Building2, Palette, Bell, Shield } from "lucide-react";

export const metadata = {
  title: "Settings -- Admin",
};

export default async function AdminSettingsPage() {
  await requireRole(["super_admin"]);

  const settingsCategories = [
    {
      title: "Organization",
      description: "Manage your organization name, logo, and contact details.",
      icon: Building2,
    },
    {
      title: "Branding",
      description: "Customize colors, logos, and visual identity for your portal.",
      icon: Palette,
    },
    {
      title: "Notifications",
      description: "Configure email, SMS, and in-app notification preferences.",
      icon: Bell,
    },
    {
      title: "Security",
      description: "Manage authentication settings, session policies, and access controls.",
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your platform settings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsCategories.map((cat) => (
          <Card key={cat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gray-50">
                  <cat.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {cat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Full settings management with editable forms is coming in a future
            update. Currently, configuration is managed through environment
            variables and the Supabase dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
