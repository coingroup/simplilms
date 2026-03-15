"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Switch,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@simplilms/ui";
import { Lock, Bell } from "lucide-react";
import { updateNotificationPreferences } from "../../actions/notifications";
import { toast } from "sonner";

interface NotificationPreferences {
  general_messages?: boolean;
  class_reminders?: boolean;
  payment_updates?: boolean;
  emergency_alerts?: boolean;
}

interface NotificationPreferencesCardProps {
  preferences: NotificationPreferences | null;
}

export function NotificationPreferencesCard({
  preferences,
}: NotificationPreferencesCardProps) {
  const [isPending, startTransition] = useTransition();
  const [generalMessages, setGeneralMessages] = useState(
    preferences?.general_messages ?? true
  );
  const [classReminders, setClassReminders] = useState(
    preferences?.class_reminders ?? true
  );

  const handleToggle = (
    field: "generalMessages" | "classReminders",
    value: boolean
  ) => {
    const newGeneral = field === "generalMessages" ? value : generalMessages;
    const newClass = field === "classReminders" ? value : classReminders;

    if (field === "generalMessages") setGeneralMessages(value);
    if (field === "classReminders") setClassReminders(value);

    startTransition(async () => {
      const result = await updateNotificationPreferences({
        generalMessages: newGeneral,
        classReminders: newClass,
      });

      if (result.success) {
        toast.success("Notification preferences updated");
      } else {
        // Revert on failure
        if (field === "generalMessages") setGeneralMessages(!value);
        if (field === "classReminders") setClassReminders(!value);
        toast.error(result.error || "Failed to update preferences");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control which notifications you receive. Some notifications cannot be
          disabled for your protection.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* General Messages — toggleable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="general-messages" className="text-sm font-medium">
              General Messages
            </Label>
            <p className="text-xs text-muted-foreground">
              Messages from school administration
            </p>
          </div>
          <Switch
            id="general-messages"
            checked={generalMessages}
            onCheckedChange={(checked) =>
              handleToggle("generalMessages", checked)
            }
            disabled={isPending}
          />
        </div>

        {/* Class Reminders — toggleable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="class-reminders" className="text-sm font-medium">
              Class Reminders
            </Label>
            <p className="text-xs text-muted-foreground">
              Reminders for upcoming class sessions
            </p>
          </div>
          <Switch
            id="class-reminders"
            checked={classReminders}
            onCheckedChange={(checked) =>
              handleToggle("classReminders", checked)
            }
            disabled={isPending}
          />
        </div>

        {/* Payment Updates — locked on */}
        <TooltipProvider>
          <div className="flex items-center justify-between opacity-70">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">Payment Updates</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Payment notifications cannot be disabled for your protection.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">
                Payment confirmations and billing alerts
              </p>
            </div>
            <Switch checked={true} disabled />
          </div>
        </TooltipProvider>

        {/* Emergency Alerts — locked on */}
        <TooltipProvider>
          <div className="flex items-center justify-between opacity-70">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">Emergency Alerts</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Emergency notifications cannot be disabled for your safety.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">
                System-wide emergency information
              </p>
            </div>
            <Switch checked={true} disabled />
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
