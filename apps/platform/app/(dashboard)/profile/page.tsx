"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Separator,
} from "@simplilms/ui";
import { createBrowserClient } from "@simplilms/auth";
import { ROLE_LABELS } from "@simplilms/auth";
import type { UserRole } from "@simplilms/database";
import { toast } from "sonner";
import { NotificationPreferencesCard } from "@simplilms/core/components/notifications/notification-preferences-card";

const profileSchema = z.object({
  address: z.string().optional(),
  mailing_address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface NotificationPreferences {
  general_messages?: boolean;
  class_reminders?: boolean;
  payment_updates?: boolean;
  emergency_alerts?: boolean;
}

interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  mailing_address: string | null;
  date_of_birth: string | null;
  citizenship_status: string | null;
  role: string | null;
  avatar_url: string | null;
  notification_preferences: NotificationPreferences | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("student");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, email, phone, address, mailing_address, date_of_birth, citizenship_status, role, avatar_url, notification_preferences"
        )
        .eq("id", user.id)
        .single();

      if (error || !data) {
        toast.error("Failed to load profile");
        setLoading(false);
        return;
      }

      const profileData = data as unknown as ProfileData;
      setProfile(profileData);
      setUserRole((profileData.role as UserRole) ?? "student");
      reset({
        address: profileData.address ?? "",
        mailing_address: profileData.mailing_address ?? "",
        phone: profileData.phone ?? "",
        email: profileData.email ?? "",
      });
      setLoading(false);
    }

    loadProfile();
  }, [reset, router]);

  const isEditable =
    userRole === "student" || userRole === "super_admin";

  async function onSubmit(data: ProfileFormData) {
    if (!profile) return;

    setSaving(true);
    const supabase = createBrowserClient();

    if (userRole === "student") {
      // Students use the secure update_student_profile function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.rpc as any)("update_student_profile", {
        p_address: data.address || null,
        p_mailing_address: data.mailing_address || null,
        p_phone: data.phone || null,
        p_email: data.email || null,
      });

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    } else if (userRole === "super_admin") {
      // Admins can update directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          address: data.address || null,
          mailing_address: data.mailing_address || null,
          phone: data.phone || null,
          email: data.email || null,
        })
        .eq("id", profile.id);

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    }

    toast.success("Profile updated successfully");
    setSaving(false);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Profile</h1>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No profile found. Your profile will be created during enrollment.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your account information.
        </p>
      </div>

      {/* Read-only info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>
            {isEditable
              ? "Some fields are read-only and can only be changed by an administrator."
              : "Your personal information is read-only."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-muted-foreground">First Name</Label>
              <p className="text-sm font-medium">
                {profile.first_name ?? "\u2014"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Last Name</Label>
              <p className="text-sm font-medium">
                {profile.last_name ?? "\u2014"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Date of Birth</Label>
              <p className="text-sm font-medium">
                {profile.date_of_birth ?? "\u2014"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Role</Label>
              <p className="text-sm font-medium">
                {ROLE_LABELS[(profile.role as UserRole) ?? "student"]}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">
                Citizenship Status
              </Label>
              <p className="text-sm font-medium">
                {profile.citizenship_status ?? "\u2014"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable fields */}
      {isEditable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <CardDescription>
              Update your contact details below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailing_address">Mailing Address</Label>
                <Input
                  id="mailing_address"
                  {...register("mailing_address")}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving || !isDirty}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences — students only */}
      {userRole === "student" && (
        <NotificationPreferencesCard
          preferences={profile.notification_preferences}
        />
      )}
    </div>
  );
}
