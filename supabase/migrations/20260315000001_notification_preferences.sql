-- Migration: Add update_notification_preferences function
-- Allows students to safely toggle general_messages and class_reminders
-- while enforcing that payment_updates and emergency_alerts cannot be disabled.

CREATE OR REPLACE FUNCTION public.update_notification_preferences(
  p_general_messages boolean DEFAULT true,
  p_class_reminders boolean DEFAULT true
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    notification_preferences = jsonb_build_object(
      'general_messages', p_general_messages,
      'class_reminders', p_class_reminders,
      'payment_updates', true,
      'emergency_alerts', true
    ),
    updated_at = now()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.update_notification_preferences(boolean, boolean) TO authenticated;
