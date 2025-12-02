import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  MessageSquare, 
  BarChart3,
  DollarSign,
  Star
} from "lucide-react";

import FacilityOverview from "@/components/facility/FacilityOverview";
import FacilityShifts from "@/components/facility/FacilityShifts";
import FacilityApplicants from "@/components/facility/FacilityApplicants";
import FacilityTeam from "@/components/facility/FacilityTeam";
import FacilityAnalytics from "@/components/facility/FacilityAnalytics";
import FacilityPayments from "@/components/facility/FacilityPayments";

export default function FacilityDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: employerProfile } = useQuery({
    queryKey: ['employer-profile', user?.email],
    queryFn: () => base44.entities.EmployerProfile.filter({ user_email: user?.email }),
    enabled: !!user,
    select: (data) => data[0],
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['facility-shifts', user?.email],
    queryFn: () => base44.entities.Shift.filter({ employer_email: user?.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['facility-applications', user?.email],
    queryFn: () => base44.entities.ShiftApplication.filter({ employer_email: user?.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['facility-ratings', user?.email],
    queryFn: () => base44.entities.StaffRating.filter({ employer_email: user?.email }),
    enabled: !!user,
  });

  const { data: serviceFees = [] } = useQuery({
    queryKey: ['facility-fees', user?.email],
    queryFn: () => base44.entities.ServiceFee.filter({ employer_email: user?.email }),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100/50 p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            {employerProfile?.facility_name || 'Facility'} Management Center
          </h1>
          <p className="text-gray-600">Complete control over your staffing operations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="shifts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              <Briefcase className="w-4 h-4 mr-2" />
              Shifts
            </TabsTrigger>
            <TabsTrigger value="applicants" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              Applicants
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              <Star className="w-4 h-4 mr-2" />
              My Team
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              <DollarSign className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <FacilityOverview 
              user={user} 
              shifts={shifts} 
              applications={applications} 
              employerProfile={employerProfile}
            />
          </TabsContent>

          <TabsContent value="shifts">
            <FacilityShifts user={user} shifts={shifts} applications={applications} />
          </TabsContent>

          <TabsContent value="applicants">
            <FacilityApplicants user={user} applications={applications} shifts={shifts} />
          </TabsContent>

          <TabsContent value="team">
            <FacilityTeam user={user} applications={applications} ratings={ratings} />
          </TabsContent>

          <TabsContent value="analytics">
            <FacilityAnalytics 
              user={user} 
              shifts={shifts} 
              applications={applications} 
              serviceFees={serviceFees}
            />
          </TabsContent>

          <TabsContent value="payments">
            <FacilityPayments user={user} serviceFees={serviceFees} shifts={shifts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}