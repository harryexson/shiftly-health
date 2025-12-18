import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, LogOut, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AccountSettings({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [accountData, setAccountData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || ""
  });
  const [updateStatus, setUpdateStatus] = useState(null);

  const updateAccountMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      setUpdateStatus('success');
      setIsEditing(false);
      if (onUpdate) onUpdate();
      setTimeout(() => setUpdateStatus(null), 3000);
    },
    onError: (error) => {
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus(null), 3000);
    }
  });

  const handleSave = () => {
    updateAccountMutation.mutate(accountData);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      base44.auth.logout();
    }
  };

  return (
    <Card className="border-blue-100/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {user?.role || 'User'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {updateStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">Account updated successfully!</p>
          </div>
        )}

        {updateStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800 font-medium">Failed to update account. Please try again.</p>
          </div>
        )}

        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={accountData.full_name}
            onChange={(e) => setAccountData({...accountData, full_name: e.target.value})}
            disabled={!isEditing}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={accountData.email}
            onChange={(e) => setAccountData({...accountData, email: e.target.value})}
            disabled={!isEditing}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            This is your login email address
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex-1"
            >
              Edit Account Info
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setAccountData({
                    full_name: user?.full_name || "",
                    email: user?.email || ""
                  });
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateAccountMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                {updateAccountMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}