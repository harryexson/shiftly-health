import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Clock, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BackgroundCheckStatus({ staffProfile, complianceRecords, onUpdate }) {
  const queryClient = useQueryClient();

  const backgroundCheck = complianceRecords.find(r => r.record_type === 'background_check');
  const hasBackgroundCheck = !!backgroundCheck;

  const initiateCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('initiateBackgroundCheck', {
        staff_email: staffProfile.user_email
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['compliance-records']);
      queryClient.invalidateQueries(['staff-profile']);
      if (onUpdate) onUpdate();
    }
  });

  const getStatusBadge = () => {
    if (!hasBackgroundCheck) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Not Started
        </Badge>
      );
    }

    switch (backgroundCheck.verification_status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Issue Detected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Unknown
          </Badge>
        );
    }
  };

  const getStatusMessage = () => {
    if (!hasBackgroundCheck) {
      return {
        title: 'Background Check Required',
        description: 'A background check is required to complete your profile verification and accept shifts.',
        color: 'bg-gray-50 border-gray-200'
      };
    }

    switch (backgroundCheck.verification_status) {
      case 'verified':
        return {
          title: '✅ Background Check Cleared',
          description: 'Your background check has been successfully completed and verified.',
          color: 'bg-green-50 border-green-200'
        };
      case 'pending':
        return {
          title: '⏳ Background Check In Progress',
          description: 'Your background check is being processed. This typically takes 1-3 business days. You\'ll be notified once complete.',
          color: 'bg-amber-50 border-amber-200'
        };
      case 'rejected':
        return {
          title: '⚠️ Background Check Requires Attention',
          description: 'There was an issue with your background check. Please contact support for more information.',
          color: 'bg-red-50 border-red-200'
        };
      default:
        return {
          title: 'Status Unknown',
          description: 'Unable to determine background check status.',
          color: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <Card className={`border-2 ${statusMessage.color}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Background Check
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={statusMessage.color}>
          <AlertDescription>
            <p className="font-semibold mb-1">{statusMessage.title}</p>
            <p className="text-sm">{statusMessage.description}</p>
          </AlertDescription>
        </Alert>

        {hasBackgroundCheck && backgroundCheck.verified_date && (
          <div className="text-sm text-gray-600">
            <p>
              <strong>Last Updated:</strong>{' '}
              {new Date(backgroundCheck.verified_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}

        {!hasBackgroundCheck && (
          <Button
            onClick={() => initiateCheckMutation.mutate()}
            disabled={initiateCheckMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
          >
            {initiateCheckMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Initiating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Start Background Check
              </>
            )}
          </Button>
        )}

        {hasBackgroundCheck && backgroundCheck.verification_status === 'pending' && (
          <div className="text-center py-2">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Verification in progress...</p>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
          <p className="mb-1">
            <strong>Powered by Checkr</strong> - Industry-leading background check provider
          </p>
          <p>
            All checks are conducted in compliance with FCRA regulations and applicable state laws.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}