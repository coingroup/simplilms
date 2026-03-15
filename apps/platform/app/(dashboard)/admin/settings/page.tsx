import { requireRole } from "@simplilms/auth/server";
import { loadTenantConfig } from "@simplilms/core/lib/load-tenant-config";
import {
  updateOrganizationSettings,
  updateBrandingSettings,
  updateFeatureFlags,
  updateNotificationSettings,
} from "@simplilms/core/actions/settings";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "Settings -- Admin",
};

export default async function AdminSettingsPage() {
  await requireRole(["super_admin"]);

  const config = await loadTenantConfig();

  // Bind server actions for the client component
  async function handleUpdateOrganization(data: {
    name: string;
    description: string;
    contactEmail: string;
    contactPhone: string;
    websiteUrl: string;
    location: string;
    trademark: string;
  }) {
    "use server";
    return updateOrganizationSettings(data);
  }

  async function handleUpdateBranding(data: {
    logoUrl: string;
    logoFallbackLetter: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  }) {
    "use server";
    return updateBrandingSettings(data);
  }

  async function handleUpdateFeatures(flags: Record<string, boolean>) {
    "use server";
    return updateFeatureFlags(flags);
  }

  async function handleUpdateNotifications(settings: {
    newInquiry: { email: boolean; inApp: boolean };
    applicationSubmitted: { email: boolean; inApp: boolean };
    paymentReceived: { email: boolean; inApp: boolean };
    systemErrors: { email: boolean; inApp: boolean };
  }) {
    "use server";
    return updateNotificationSettings(settings);
  }

  return (
    <SettingsClient
      config={config}
      updateOrganization={handleUpdateOrganization}
      updateBranding={handleUpdateBranding}
      updateFeatures={handleUpdateFeatures}
      updateNotifications={handleUpdateNotifications}
    />
  );
}
