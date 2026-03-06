import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Search, CheckCircle, Clock, AlertTriangle, Play, Loader2 } from "lucide-react";

export default function BackgroundCheckPanel() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const queryClient = useQueryClient();

  const { data: staffProfiles = [] } = useQuery({
    queryKey: ['staff-profiles-admin'],
    queryFn: () => base44.entities.StaffProfile.filter({}),
  });

  const { data: backgroundChecks = [] } = useQuery({
    queryKey: ['background-checks-admin'],
    queryFn: () => base44.entities.ComplianceRecord.filter({
      record_type: 'background_check'
    }),
  });

  const initiateCheckMutation = useMutation({
    mutationFn: async (staff_email) => {
      const response = await base44.functions.invoke('initiateBackgroundCheck', {
        staff_email
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['background-checks-admin']);
      queryClient.invalidateQueries(['staff-profiles-admin']);
    }
  });

  const getStaffCheck = (staff_email) => {
    return backgroundChecks.find(check => check.user_email === staff_email);
  };

  const filteredStaff = staffProfiles.filter(staff => 
    staff.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = backgroundChecks.filter(c => c.verification_status === 'pending').length;
  const verifiedCount = backgroundChecks.filter(c => c.verification_status === 'verified').length;
  const noCheckCount = staffProfiles.length - backgroundChecks.length;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-3xl font-bold text-green-600">{verifiedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Not Started</p>
                <p className="text-3xl font-bold text-red-600">{noCheckCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Staff Background Checks
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredStaff.map((staff) => {
              const check = getStaffCheck(staff.user_email);
              
              return (
                <div key={staff.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{staff.full_name}</p>
                    <p className="text-sm text-gray-600">{staff.user_email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {staff.staff_type?.replace(/_/g, ' ')} • {staff.city}, {staff.state}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {check ? (
                      <>
                        {check.verification_status === 'verified' && (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {check.verification_status === 'pending' && (
                          <Badge className="bg-amber-100 text-amber-700">
                            <Clock className="w-3 h-3 mr-1" />
                            In Progress
                          </Badge>
                        )}
                        {check.verification_status === 'rejected' && (
                          <Badge className="bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Issue
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => initiateCheckMutation.mutate(staff.user_email)}
                        disabled={initiateCheckMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 to-teal-600"
                      >
                        {initiateCheckMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Start Check
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}