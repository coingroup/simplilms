"use client";

import { useState, useTransition } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Textarea,
  Button,
  Switch,
  Separator,
} from "@simplilms/ui";
import type { TenantConfig } from "@simplilms/core/lib/tenant-config";
import {
  Building2,
  Palette,
  ToggleRight,
  Bell,
  Check,
  Loader2,
  RotateCcw,
} from "lucide-react";

// ============================================================
// Types
// ============================================================

interface SettingsClientProps {
  config: TenantConfig;
  updateOrganization: (data: {
    name: string;
    description: string;
    contactEmail: string;
    contactPhone: string;
    websiteUrl: string;
    location: string;
    trademark: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateBranding: (data: {
    logoUrl: string;
    logoFallbackLetter: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateFeatures: (
    flags: Record<string, boolean>
  ) => Promise<{ success: boolean; error?: string }>;
  updateNotifications: (
    settings: NotificationSettings
  ) => Promise<{ success: boolean; error?: string }>;
}

interface NotificationSettings {
  newInquiry: { email: boolean; inApp: boolean };
  applicationSubmitted: { email: boolean; inApp: boolean };
  paymentReceived: { email: boolean; inApp: boolean };
  systemErrors: { email: boolean; inApp: boolean };
}

// ============================================================
// Feedback Banner
// ============================================================

function FeedbackBanner({
  message,
}: {
  message: { type: "success" | "error"; text: string } | null;
}) {
  if (!message) return null;
  return (
    <div
      className={`rounded-md px-4 py-3 text-sm ${
        message.type === "success"
          ? "bg-green-50 text-green-800 border border-green-200"
          : "bg-red-50 text-red-800 border border-red-200"
      }`}
    >
      {message.type === "success" && (
        <Check className="inline h-4 w-4 mr-1.5 -mt-0.5" />
      )}
      {message.text}
    </div>
  );
}

// ============================================================
// Organization Tab
// ============================================================

function OrganizationTab({
  config,
  onSave,
}: {
  config: TenantConfig;
  onSave: SettingsClientProps["updateOrganization"];
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await onSave({
        name: (fd.get("name") as string) || "",
        description: (fd.get("description") as string) || "",
        contactEmail: (fd.get("contactEmail") as string) || "",
        contactPhone: (fd.get("contactPhone") as string) || "",
        websiteUrl: (fd.get("websiteUrl") as string) || "",
        location: (fd.get("location") as string) || "",
        trademark: (fd.get("trademark") as string) || "",
      });
      if (result.success) {
        setMessage({ type: "success", text: "Organization settings saved." });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to save.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization Details</CardTitle>
          <CardDescription>
            Basic information about your school or training facility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Organization Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={config.name}
              required
              placeholder="e.g. Acme Training Academy"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={config.description}
              rows={3}
              placeholder="Brief description of your organization"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={config.email}
                placeholder="admissions@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                defaultValue={config.phone}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                defaultValue={config.websiteUrl}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={config.location}
                placeholder="Atlanta, GA"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trademark">Trademark / Legal Name</Label>
            <Input
              id="trademark"
              name="trademark"
              defaultValue={config.trademark || ""}
              placeholder="Used in footers and legal text"
            />
            <p className="text-xs text-gray-500">
              Optional. Shown in the footer and legal notices.
            </p>
          </div>
        </CardContent>
      </Card>

      <FeedbackBanner message={message} />

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Organization Settings"
        )}
      </Button>
    </form>
  );
}

// ============================================================
// Branding Tab
// ============================================================

function BrandingTab({
  config,
  onSave,
}: {
  config: TenantConfig;
  onSave: SettingsClientProps["updateBranding"];
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [primaryColor, setPrimaryColor] = useState(config.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(config.secondaryColor);
  const [accentColor, setAccentColor] = useState(config.accentColor);
  const [logoFallbackLetter, setLogoFallbackLetter] = useState(
    config.logoFallbackLetter
  );

  function resetColors() {
    setPrimaryColor("#F26822");
    setSecondaryColor("#FFCE38");
    setAccentColor("#FAA62E");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await onSave({
        logoUrl: (fd.get("logoUrl") as string) || "",
        logoFallbackLetter: logoFallbackLetter,
        primaryColor,
        secondaryColor,
        accentColor,
      });
      if (result.success) {
        setMessage({
          type: "success",
          text: "Branding settings saved. Refresh the page to see updated colors.",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to save.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Logo</CardTitle>
          <CardDescription>
            Your logo is displayed in the sidebar, login pages, and emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              defaultValue={config.logoUrl || ""}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-gray-500">
              Recommended: 200x200px or larger, PNG/SVG with transparent
              background.
            </p>
          </div>

          {config.logoUrl && (
            <div className="flex items-center gap-4">
              <p className="text-xs text-gray-500">Current logo:</p>
              <img
                src={config.logoUrl}
                alt="Current logo"
                className="h-12 w-12 rounded-lg object-contain border border-gray-200"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="logoFallbackLetter">Fallback Letter</Label>
            <div className="flex items-center gap-3">
              <Input
                id="logoFallbackLetter"
                maxLength={1}
                className="w-16 text-center text-lg font-bold"
                value={logoFallbackLetter}
                onChange={(e) =>
                  setLogoFallbackLetter(
                    e.target.value.charAt(0).toUpperCase() || ""
                  )
                }
              />
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background: `linear-gradient(135deg, ${secondaryColor}, ${accentColor}, ${primaryColor})`,
                }}
              >
                {logoFallbackLetter || "?"}
              </div>
              <p className="text-xs text-gray-500">
                Shown when no logo URL is set
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Brand Colors</CardTitle>
              <CardDescription>
                Colors used throughout the platform for buttons, links, and
                accents.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetColors}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Primary Color */}
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                  placeholder="#F26822"
                />
                <input
                  type="color"
                  value={primaryColor}
                  className="h-10 w-10 rounded border border-gray-200 cursor-pointer shrink-0"
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">Buttons, links, CTAs</p>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                  placeholder="#FFCE38"
                />
                <input
                  type="color"
                  value={secondaryColor}
                  className="h-10 w-10 rounded border border-gray-200 cursor-pointer shrink-0"
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">Gradients, badges</p>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                  placeholder="#FAA62E"
                />
                <input
                  type="color"
                  value={accentColor}
                  className="h-10 w-10 rounded border border-gray-200 cursor-pointer shrink-0"
                  onChange={(e) => setAccentColor(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">Progress bars, highlights</p>
            </div>
          </div>

          {/* Color Preview */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
            <div className="flex flex-wrap gap-3">
              <div className="text-center">
                <div
                  className="h-14 w-14 rounded-lg border border-gray-200 shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                />
                <p className="text-[10px] text-gray-500 mt-1">Primary</p>
              </div>
              <div className="text-center">
                <div
                  className="h-14 w-14 rounded-lg border border-gray-200 shadow-sm"
                  style={{ backgroundColor: secondaryColor }}
                />
                <p className="text-[10px] text-gray-500 mt-1">Secondary</p>
              </div>
              <div className="text-center">
                <div
                  className="h-14 w-14 rounded-lg border border-gray-200 shadow-sm"
                  style={{ backgroundColor: accentColor }}
                />
                <p className="text-[10px] text-gray-500 mt-1">Accent</p>
              </div>
              <div className="text-center">
                <div
                  className="h-14 w-14 rounded-lg border border-gray-200 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${secondaryColor}, ${accentColor}, ${primaryColor})`,
                  }}
                />
                <p className="text-[10px] text-gray-500 mt-1">Gradient</p>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  className="h-14 px-4 rounded-lg text-white text-sm font-medium shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  Button
                </button>
                <p className="text-[10px] text-gray-500 mt-1">Sample</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FeedbackBanner message={message} />

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Branding Settings"
        )}
      </Button>
    </form>
  );
}

// ============================================================
// Features Tab
// ============================================================

interface FeatureToggle {
  key: string;
  dbKey: string;
  label: string;
  description: string;
}

const CORE_FEATURES: FeatureToggle[] = [
  {
    key: "lmsEnabled",
    dbKey: "lms_enabled",
    label: "LMS (Courses & Lessons)",
    description: "Enable the learning management system with courses, modules, and lessons.",
  },
  {
    key: "aiCourseCreator",
    dbKey: "ai_course_creator",
    label: "AI Course Creator",
    description: "Use AI to generate course outlines and content from interviews.",
  },
  {
    key: "quizzes",
    dbKey: "quizzes",
    label: "Quizzes",
    description: "Enable quiz creation and automated grading within courses.",
  },
  {
    key: "certificates",
    dbKey: "certificates",
    label: "Certificates",
    description: "Auto-generate completion certificates when students finish a course.",
  },
  {
    key: "stripeConnect",
    dbKey: "stripe_connect",
    label: "Stripe Connect (Instructor Marketplace)",
    description: "Enable instructor payouts via Stripe Connect for paid teachers.",
  },
];

const ADMISSIONS_FEATURES: FeatureToggle[] = [
  {
    key: "isaEnabled",
    dbKey: "isa_enabled",
    label: "Income Share Agreements (ISA)",
    description: "Allow students to select ISA as a tuition payment method.",
  },
  {
    key: "remarketingEnabled",
    dbKey: "remarketing_enabled",
    label: "Remarketing Tools",
    description: "Enable email/SMS/WhatsApp remarketing campaigns from the CRM.",
  },
  {
    key: "zoomIntegration",
    dbKey: "zoom_integration",
    label: "Zoom Integration",
    description: "Enable live classroom sessions via Zoom within the platform.",
  },
];

const SECTOR_FEATURES: FeatureToggle[] = [
  {
    key: "sectorRealEstate",
    dbKey: "sector_real_estate",
    label: "Real Estate",
    description: "Pre-licensing, CE, and exam prep for real estate agents.",
  },
  {
    key: "sectorInsurance",
    dbKey: "sector_insurance",
    label: "Insurance & Financial Services",
    description: "Insurance licensing, CE, and compliance training.",
  },
  {
    key: "sectorHealthcare",
    dbKey: "sector_healthcare",
    label: "Healthcare Training",
    description: "CNA, medical assistant, phlebotomy, and allied health programs.",
  },
  {
    key: "sectorCdlTrucking",
    dbKey: "sector_cdl_trucking",
    label: "CDL / Trucking",
    description: "Commercial driving license training and ELDT compliance.",
  },
  {
    key: "sectorCosmetology",
    dbKey: "sector_cosmetology",
    label: "Cosmetology & Beauty",
    description: "Cosmetology, esthetics, and barbering school programs.",
  },
  {
    key: "sectorItTech",
    dbKey: "sector_it_tech",
    label: "IT & Technology",
    description: "CompTIA, AWS, Azure, and software development training.",
  },
  {
    key: "sectorCorporateCompliance",
    dbKey: "sector_corporate_compliance",
    label: "Corporate Compliance",
    description: "OSHA, HIPAA, EEO, and workplace compliance training.",
  },
  {
    key: "sectorGovernment",
    dbKey: "sector_government",
    label: "Government",
    description: "Federal and state government agency training programs.",
  },
];

function FeaturesTab({
  config,
  onSave,
}: {
  config: TenantConfig;
  onSave: SettingsClientProps["updateFeatures"];
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Build initial flags state from config
  const initialFlags: Record<string, boolean> = {};
  for (const f of [...CORE_FEATURES, ...ADMISSIONS_FEATURES, ...SECTOR_FEATURES]) {
    initialFlags[f.dbKey] =
      config.features[f.key as keyof typeof config.features] ?? false;
  }
  const [flags, setFlags] = useState(initialFlags);

  function toggleFlag(dbKey: string) {
    setFlags((prev) => ({ ...prev, [dbKey]: !prev[dbKey] }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await onSave(flags);
      if (result.success) {
        setMessage({ type: "success", text: "Feature flags saved." });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to save.",
        });
      }
    });
  }

  function renderToggles(features: FeatureToggle[]) {
    return (
      <div className="space-y-4">
        {features.map((feature) => (
          <div
            key={feature.dbKey}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {feature.label}
              </p>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </div>
            <Switch
              checked={flags[feature.dbKey] ?? false}
              onCheckedChange={() => toggleFlag(feature.dbKey)}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Core Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Core Features</CardTitle>
          <CardDescription>
            Primary platform capabilities that apply to all schools.
          </CardDescription>
        </CardHeader>
        <CardContent>{renderToggles(CORE_FEATURES)}</CardContent>
      </Card>

      {/* Admissions & Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Admissions & Communication
          </CardTitle>
          <CardDescription>
            Tools for managing the admissions pipeline and student
            communication.
          </CardDescription>
        </CardHeader>
        <CardContent>{renderToggles(ADMISSIONS_FEATURES)}</CardContent>
      </Card>

      {/* Sector Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sector Modules</CardTitle>
          <CardDescription>
            Industry-specific course content, compliance tracking, and question
            banks. Enable the sectors relevant to your school.
          </CardDescription>
        </CardHeader>
        <CardContent>{renderToggles(SECTOR_FEATURES)}</CardContent>
      </Card>

      <FeedbackBanner message={message} />

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Feature Flags"
        )}
      </Button>
    </form>
  );
}

// ============================================================
// Notifications Tab
// ============================================================

function NotificationsTab({
  config,
  onSave,
}: {
  config: TenantConfig;
  onSave: SettingsClientProps["updateNotifications"];
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [settings, setSettings] = useState<NotificationSettings>({
    newInquiry: { email: true, inApp: true },
    applicationSubmitted: { email: true, inApp: true },
    paymentReceived: { email: true, inApp: true },
    systemErrors: { email: true, inApp: true },
  });

  function toggleSetting(
    category: keyof NotificationSettings,
    channel: "email" | "inApp"
  ) {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel],
      },
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await onSave(settings);
      if (result.success) {
        setMessage({
          type: "success",
          text: "Notification preferences saved.",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to save.",
        });
      }
    });
  }

  const notificationCategories: {
    key: keyof NotificationSettings;
    label: string;
    description: string;
  }[] = [
    {
      key: "newInquiry",
      label: "New Inquiry",
      description:
        "When a prospect submits the interest form on the public website.",
    },
    {
      key: "applicationSubmitted",
      label: "Application Submitted",
      description: "When a student submits their full application.",
    },
    {
      key: "paymentReceived",
      label: "Payment Received",
      description:
        "When an enrollment or tuition payment is successfully processed.",
    },
    {
      key: "systemErrors",
      label: "System Errors",
      description:
        "When a workflow error, webhook failure, or API issue occurs.",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Admin Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how administrators receive notifications for key platform
            events. These settings control notifications sent to admin users,
            not students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_60px_60px] gap-4 mb-4">
            <div />
            <p className="text-xs font-medium text-gray-500 text-center">
              Email
            </p>
            <p className="text-xs font-medium text-gray-500 text-center">
              In-App
            </p>
          </div>

          <div className="space-y-5">
            {notificationCategories.map((cat) => (
              <div
                key={cat.key}
                className="grid grid-cols-[1fr_60px_60px] gap-4 items-center"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {cat.label}
                  </p>
                  <p className="text-xs text-gray-500">{cat.description}</p>
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={settings[cat.key].email}
                    onCheckedChange={() => toggleSetting(cat.key, "email")}
                  />
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={settings[cat.key].inApp}
                    onCheckedChange={() => toggleSetting(cat.key, "inApp")}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <FeedbackBanner message={message} />

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Notification Preferences"
        )}
      </Button>
    </form>
  );
}

// ============================================================
// Main Settings Client Component
// ============================================================

export function SettingsClient({
  config,
  updateOrganization,
  updateBranding,
  updateFeatures,
  updateNotifications,
}: SettingsClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your platform settings, branding, and feature flags.
        </p>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="organization">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger
            value="organization"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <Building2 className="h-3.5 w-3.5 hidden sm:block" />
            Organization
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <Palette className="h-3.5 w-3.5 hidden sm:block" />
            Branding
          </TabsTrigger>
          <TabsTrigger
            value="features"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <ToggleRight className="h-3.5 w-3.5 hidden sm:block" />
            Features
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <Bell className="h-3.5 w-3.5 hidden sm:block" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="mt-6">
          <OrganizationTab config={config} onSave={updateOrganization} />
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <BrandingTab config={config} onSave={updateBranding} />
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <FeaturesTab config={config} onSave={updateFeatures} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationsTab config={config} onSave={updateNotifications} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
