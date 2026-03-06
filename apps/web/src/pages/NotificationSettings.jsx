import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Moon,
  Save,
  CheckCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NotificationSettings() {
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreferences.filter({ 
        user_email: user?.email 
      });
      return prefs[0];
    },
    enabled: !!user,
  });

  const [settings, setSettings] = useState(null);

  React.useEffect(() => {
    if (preferences) {
      setSettings(preferences);
    } else if (user) {
      // Set default preferences
      setSettings({
        user_email: user.email,
        email_notifications: {
          new_shift_matches: true,
          application_updates: true,
          shift_reminders: true,
          new_applications: true,
          urgent_shifts: true,
          payment_updates: true,
          marketing: false
        },
        push_notifications: {
          enabled: true,
          new_shift_matches: true,
          application_updates: true,
          urgent_shifts: true,
          new_applications: true,
          shift_cancellations: true
        },
        notification_frequency: "realtime",
        quiet_hours: {
          enabled: false,
          start_time: "22:00",
          end_time: "07:00"
        },
        sms_notifications: {
          enabled: false,
          urgent_only: true
        }
      });
    }
  }, [preferences, user]);

  const saveMutation = useMutation({
    mutationFn: async (settingsData) => {
      if (preferences) {
        return await base44.entities.NotificationPreferences.update(preferences.id, settingsData);
      } else {
        return await base44.entities.NotificationPreferences.create(settingsData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const updateSetting = (path, value) => {
    const keys = path.split('.');
    setSettings(prev => {
      const newSettings = { ...prev };
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Bell className="w-6 h-6 text-blue-600" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Customize how and when you receive notifications
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Save Success Banner */}
        {saved && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-900">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Preferences saved successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Choose which emails you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-shift-matches" className="font-medium">New Shift Matches</Label>
                <p className="text-sm text-gray-600">Get notified when shifts match your preferences</p>
              </div>
              <Switch
                id="email-shift-matches"
                checked={settings.email_notifications.new_shift_matches}
                onCheckedChange={(checked) => updateSetting('email_notifications.new_shift_matches', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-app-updates" className="font-medium">Application Updates</Label>
                <p className="text-sm text-gray-600">Status changes on your shift applications</p>
              </div>
              <Switch
                id="email-app-updates"
                checked={settings.email_notifications.application_updates}
                onCheckedChange={(checked) => updateSetting('email_notifications.application_updates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-reminders" className="font-medium">Shift Reminders</Label>
                <p className="text-sm text-gray-600">Reminders 24 hours before your shift</p>
              </div>
              <Switch
                id="email-reminders"
                checked={settings.email_notifications.shift_reminders}
                onCheckedChange={(checked) => updateSetting('email_notifications.shift_reminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-new-apps" className="font-medium">New Applications</Label>
                <p className="text-sm text-gray-600">When staff applies to your shifts</p>
              </div>
              <Switch
                id="email-new-apps"
                checked={settings.email_notifications.new_applications}
                onCheckedChange={(checked) => updateSetting('email_notifications.new_applications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-urgent" className="font-medium">Urgent Shifts</Label>
                <p className="text-sm text-gray-600">Last-minute shift opportunities</p>
              </div>
              <Switch
                id="email-urgent"
                checked={settings.email_notifications.urgent_shifts}
                onCheckedChange={(checked) => updateSetting('email_notifications.urgent_shifts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-payment" className="font-medium">Payment Updates</Label>
                <p className="text-sm text-gray-600">Billing, payments, and invoices</p>
              </div>
              <Switch
                id="email-payment"
                checked={settings.email_notifications.payment_updates}
                onCheckedChange={(checked) => updateSetting('email_notifications.payment_updates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-marketing" className="font-medium">Marketing & Promotions</Label>
                <p className="text-sm text-gray-600">News, tips, and special offers</p>
              </div>
              <Switch
                id="email-marketing"
                checked={settings.email_notifications.marketing}
                onCheckedChange={(checked) => updateSetting('email_notifications.marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-600" />
              In-App Push Notifications
            </CardTitle>
            <CardDescription>
              Real-time alerts within the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <Label htmlFor="push-enabled" className="font-semibold text-blue-900">Enable Push Notifications</Label>
                <p className="text-sm text-blue-700">Master switch for in-app notifications</p>
              </div>
              <Switch
                id="push-enabled"
                checked={settings.push_notifications.enabled}
                onCheckedChange={(checked) => updateSetting('push_notifications.enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-shift-matches">New Shift Matches</Label>
                <p className="text-sm text-gray-600">Instantly see matching opportunities</p>
              </div>
              <Switch
                id="push-shift-matches"
                checked={settings.push_notifications.new_shift_matches}
                onCheckedChange={(checked) => updateSetting('push_notifications.new_shift_matches', checked)}
                disabled={!settings.push_notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-app-updates">Application Updates</Label>
                <p className="text-sm text-gray-600">Know immediately when status changes</p>
              </div>
              <Switch
                id="push-app-updates"
                checked={settings.push_notifications.application_updates}
                onCheckedChange={(checked) => updateSetting('push_notifications.application_updates', checked)}
                disabled={!settings.push_notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-urgent">Urgent Shifts</Label>
                <p className="text-sm text-gray-600">Time-sensitive opportunities</p>
              </div>
              <Switch
                id="push-urgent"
                checked={settings.push_notifications.urgent_shifts}
                onCheckedChange={(checked) => updateSetting('push_notifications.urgent_shifts', checked)}
                disabled={!settings.push_notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-new-apps">New Applications</Label>
                <p className="text-sm text-gray-600">When staff applies to your shifts</p>
              </div>
              <Switch
                id="push-new-apps"
                checked={settings.push_notifications.new_applications}
                onCheckedChange={(checked) => updateSetting('push_notifications.new_applications', checked)}
                disabled={!settings.push_notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-cancellations">Shift Cancellations</Label>
                <p className="text-sm text-gray-600">Immediate alerts for cancellations</p>
              </div>
              <Switch
                id="push-cancellations"
                checked={settings.push_notifications.shift_cancellations}
                onCheckedChange={(checked) => updateSetting('push_notifications.shift_cancellations', checked)}
                disabled={!settings.push_notifications.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Frequency</CardTitle>
            <CardDescription>
              Control how often you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="frequency">Delivery Frequency</Label>
                <Select
                  value={settings.notification_frequency}
                  onValueChange={(value) => updateSetting('notification_frequency', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time (Instant)</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-2">
                  {settings.notification_frequency === 'realtime' && 'Get notified immediately as events happen'}
                  {settings.notification_frequency === 'hourly' && 'Receive a summary every hour'}
                  {settings.notification_frequency === 'daily' && 'Receive a daily summary email'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-600" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Pause non-urgent notifications during specific hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quiet-enabled" className="font-medium">Enable Quiet Hours</Label>
                <p className="text-sm text-gray-600">Silence notifications during sleep time</p>
              </div>
              <Switch
                id="quiet-enabled"
                checked={settings.quiet_hours.enabled}
                onCheckedChange={(checked) => updateSetting('quiet_hours.enabled', checked)}
              />
            </div>

            {settings.quiet_hours.enabled && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-purple-200">
                <div>
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={settings.quiet_hours.start_time}
                    onChange={(e) => updateSetting('quiet_hours.start_time', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end">End Time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={settings.quiet_hours.end_time}
                    onChange={(e) => updateSetting('quiet_hours.end_time', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              SMS Notifications
            </CardTitle>
            <CardDescription>
              Text message alerts for critical updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-enabled" className="font-medium">Enable SMS Notifications</Label>
                <p className="text-sm text-gray-600">Receive text messages for important alerts</p>
              </div>
              <Switch
                id="sms-enabled"
                checked={settings.sms_notifications.enabled}
                onCheckedChange={(checked) => updateSetting('sms_notifications.enabled', checked)}
              />
            </div>

            {settings.sms_notifications.enabled && (
              <div className="flex items-center justify-between pl-4 border-l-2 border-green-200">
                <div>
                  <Label htmlFor="sms-urgent">Urgent Only</Label>
                  <p className="text-sm text-gray-600">Only send SMS for urgent notifications</p>
                </div>
                <Switch
                  id="sms-urgent"
                  checked={settings.sms_notifications.urgent_only}
                  onCheckedChange={(checked) => updateSetting('sms_notifications.urgent_only', checked)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            {saveMutation.isPending ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}