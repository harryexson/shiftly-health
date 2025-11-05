
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield,
  Save,
  DollarSign,
  Clock,
  Bell,
  MapPin,
  CheckCircle
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function SystemSettings() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: settings = [] } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => base44.asServiceRole.entities.SystemSettings.list(),
    enabled: !!user && user.role === 'admin',
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, value }) => {
      return await base44.asServiceRole.entities.SystemSettings.update(id, {
        setting_value: value,
        last_modified_by: user.email,
        last_modified_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });

  const createDefaultSettings = async () => {
    const defaultSettings = [
      {
        setting_key: "platform_service_fee_percentage",
        setting_value: "10", // Updated from "5" to "10"
        setting_type: "number",
        category: "billing",
        description: "Platform service fee charged to facilities (percentage)"
      },
      {
        setting_key: "instant_payout_fee_percentage",
        setting_value: "1.5",
        setting_type: "number",
        category: "billing",
        description: "Fee for instant payouts to workers (percentage)"
      },
      {
        setting_key: "standard_payout_days",
        setting_value: "3",
        setting_type: "number",
        category: "billing",
        description: "Days for standard payout processing"
      },
      {
        setting_key: "shift_response_window_minutes",
        setting_value: "15",
        setting_type: "number",
        category: "matching",
        description: "Minutes staff have to respond to shift offers"
      },
      {
        setting_key: "proximity_radius_miles",
        setting_value: "15",
        setting_type: "number",
        category: "matching",
        description: "Default radius for shift matching"
      },
      {
        setting_key: "weekend_premium_percentage",
        setting_value: "20",
        setting_type: "number",
        category: "billing",
        description: "Weekend shift premium percentage"
      },
      {
        setting_key: "night_shift_premium_percentage",
        setting_value: "15",
        setting_type: "number",
        category: "billing",
        description: "Night shift premium percentage"
      },
      {
        setting_key: "auto_suspend_overdue_days",
        setting_value: "30",
        setting_type: "number",
        category: "billing",
        description: "Days overdue before auto-suspension"
      },
      {
        setting_key: "notifications_enabled",
        setting_value: "true",
        setting_type: "boolean",
        category: "notifications",
        description: "Enable platform-wide notifications"
      },
      {
        setting_key: "platform_name",
        setting_value: "HealthStaff Connect",
        setting_type: "string",
        category: "general",
        description: "Platform display name"
      }
    ];

    for (const setting of defaultSettings) {
      await base44.asServiceRole.entities.SystemSettings.create({
        ...setting,
        last_modified_by: user.email,
        last_modified_date: new Date().toISOString()
      });
    }

    queryClient.invalidateQueries({ queryKey: ['system-settings'] });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">This area is restricted to platform administrators only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSetting = (key) => settings.find(s => s.setting_key === key);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-indigo-100/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Settings className="w-7 h-7 text-indigo-600" />
                  System Settings
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Configure platform-wide settings and parameters
                </p>
              </div>
              {settings.length === 0 && (
                <Button
                  onClick={createDefaultSettings}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Initialize Default Settings
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {settings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No system settings configured</p>
              <Button onClick={createDefaultSettings} className="bg-indigo-600 hover:bg-indigo-700">
                Create Default Settings
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Billing Settings */}
            <Card className="border-green-100/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Billing & Payment Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingField
                  label="Platform Service Fee"
                  description="Percentage charged to facilities for each completed shift"
                  setting={getSetting("platform_service_fee_percentage")}
                  suffix="%"
                  onSave={(value) => updateSettingMutation.mutate({ 
                    id: getSetting("platform_service_fee_percentage")?.id, 
                    value 
                  })}
                />

                <SettingField
                  label="Instant Payout Fee"
                  description="Fee charged to workers for instant payouts (30 minutes)"
                  setting={getSetting("instant_payout_fee_percentage")}
                  suffix="%"
                  onSave={(value) => updateSettingMutation.mutate({ 
                    id: getSetting("instant_payout_fee_percentage")?.id, 
                    value 
                  })}
                />

                <SettingField
                  label="Standard Payout Processing Time"
                  description="Days for free standard payout processing"
                  setting={getSetting("standard_payout_days")}
                  suffix="days"
                  onSave={(value) => updateSettingMutation.mutate({ 
                    id: getSetting("standard_payout_days")?.id, 
                    value 
                  })}
                />

                <SettingField
                  label="Weekend Premium"
                  description="Additional pay for weekend shifts"
                  setting={getSetting("weekend_premium_percentage")}
                  suffix="%"
                  onSave={(value) => updateSettingMutation.mutate({ 
                    id: getSetting("weekend_premium_percentage")?.id, 
                    value 
                  })}
                />

                <SettingField
                  label="Night Shift Premium"
                  description="Additional pay for night shifts"
                  setting={getSetting("night_shift_premium_percentage")}
                  suffix="%"
                  onSave={(value) => updateSettingMutation.mutate({ 
                    id: getSetting("night_shift_premium_percentage")?.id, 
                    value 
                  })}
                />

                <SettingField
                  label="Auto-Suspension Threshold"
                  description="Days overdue before automatic account suspension"
                  setting={getSetting("auto_suspend_overdue_days")}
                  suffix="days"
                  onSave={(value) => updateSettingMutation.mutate({ 
                    id: getSetting("auto_suspend_overdue_days")?.id, 
                    value 
                  })}
                />
              </CardContent>
            </Card>

            {/* Matching Settings */}
            <Card className="border-purple-100/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-6 h-6 text-purple-600" />
                  Matching & Proximity Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingField
                  label="Default Proximity Radius"
                  description="Maximum distance for shift matching"
                  setting={getSetting("proximity_radius_miles")}
                  suffix="miles"
                  onSave={(value) => updateSettingMutation.mutate({ 
                    id: getSetting("proximity_radius_miles")?.id, 
                    value 
                  })}
                />

                <SettingField
                  label="Shift Response Window"
                  description="Time staff have to respond to shift offers"
                  setting={getSetting("shift_response_window_minutes")}
                  suffix="minutes"
                  onSave={(value) => updateSettingMutation.mutate({ 
                    id: getSetting("shift_response_window_minutes")?.id, 
                    value 
                  })}
                />
              </CardContent>
            </Card>

            {/* General Settings */}
            <Card className="border-blue-100/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Settings className="w-6 h-6 text-blue-600" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingField
                  label="Platform Name"
                  description="Display name for the platform"
                  setting={getSetting("platform_name")}
                  onSave={(value) => updateSettingMutation.mutate({ 
                    id: getSetting("platform_name")?.id, 
                    value 
                  })}
                />

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <Label className="font-semibold text-blue-900">Platform Notifications</Label>
                    <p className="text-sm text-blue-700">Enable system-wide notifications</p>
                  </div>
                  <Switch
                    checked={getSetting("notifications_enabled")?.setting_value === "true"}
                    onCheckedChange={(checked) => {
                      const setting = getSetting("notifications_enabled");
                      if (setting) {
                        updateSettingMutation.mutate({ 
                          id: setting.id, 
                          value: checked.toString() 
                        });
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function SettingField({ label, description, setting, suffix, onSave }) {
  const [value, setValue] = useState(setting?.setting_value || "");
  const [editing, setEditing] = useState(false);

  React.useEffect(() => {
    setValue(setting?.setting_value || "");
  }, [setting]);

  const handleSave = () => {
    onSave(value);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-1 mr-4">
        <Label className="font-semibold text-gray-900">{label}</Label>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <div className="flex items-center gap-1">
              <Input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-24 h-9"
              />
              {suffix && <span className="text-sm text-gray-600">{suffix}</span>}
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setValue(setting?.setting_value || "");
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {setting?.setting_value || "Not set"} {suffix}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
