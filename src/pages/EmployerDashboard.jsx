import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Briefcase, 
  Users, 
  DollarSign,
  Calendar,
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  Shield, // Added Shield icon
  CheckCircle // Added CheckCircle icon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import OnboardingChecklist from "../components/onboarding/OnboardingChecklist";

export default function EmployerDashboard() {
  const [user, setUser] = React.useState(null);
  const [onboardingProgress, setOnboardingProgress] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load onboarding progress
      if (currentUser) {
        const progress = await base44.entities.OnboardingProgress.filter({
          user_email: currentUser.email
        });
        if (progress.length > 0) {
          setOnboardingProgress(progress[0]);
        }
      }
    };
    loadUser();
  }, []);

  const { data: shifts = [] } = useQuery({
    queryKey: ['employer-shifts', user?.email],
    queryFn: () => base44.entities.Shift.filter({ employer_email: user?.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['shift-applications', user?.email],
    queryFn: () => base44.entities.ShiftApplication.filter({ employer_email: user?.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: employerProfile } = useQuery({
    queryKey: ['employer-profile', user?.email],
    queryFn: () => base44.entities.EmployerProfile.filter({ user_email: user?.email }),
    enabled: !!user,
    select: (data) => data[0],
  });

  const openShifts = shifts.filter(s => s.status === 'open');
  const pendingApplications = applications.filter(a => a.status === 'pending');
  const totalSpent = shifts.reduce((sum, s) => sum + ((s.hourly_rate || 0) * 8), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100/50 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                {employerProfile?.facility_name || 'Facility'} Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Manage your shifts and workforce</p>
              <p className="text-sm text-gray-500 mt-2">
                🚀 <span className="font-semibold">Platform Advantage:</span> Fill shifts 40% faster and save up to 40% vs traditional staffing agencies
              </p>
            </div>
            <Link to={createPageUrl("PostShift")}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-500/30">
                <Plus className="w-5 h-5 mr-2" />
                Post New Shift
              </Button>
            </Link>
          </div>
        </div>

        {/* Onboarding Checklist */}
        {onboardingProgress && onboardingProgress.onboarding_status !== 'completed' && (
          <OnboardingChecklist progress={onboardingProgress} userType="employer" />
        )}

        {/* Value Prop Banner for New Users */}
        {shifts.length === 0 && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-teal-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Shield className="w-12 h-12 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to On-Demand Healthcare Staffing! 🏥</h3>
                  <p className="text-gray-700 mb-4">
                    Shiftly Health helps you address the national healthcare worker shortage with technology-driven solutions:
                  </p>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Fill Gaps Fast</p>
                        <p className="text-xs text-gray-600">Post and fill shifts in minutes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Verified Staff</p>
                        <p className="text-xs text-gray-600">All credentials checked</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Save 40%</p>
                        <p className="text-xs text-gray-600">vs traditional agencies</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Flexible</p>
                        <p className="text-xs text-gray-600">Scale with patient demand</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Alert */}
        {employerProfile?.subscription_status === 'trial' && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Trial Period Active</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Your trial ends on {employerProfile.trial_end_date ? format(new Date(employerProfile.trial_end_date), 'MMM d, yyyy') : 'soon'}. 
                    Upgrade to continue posting shifts.
                  </p>
                  <Link to={createPageUrl("Billing")}>
                    <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700">
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-100/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Open Shifts</CardTitle>
              <Briefcase className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{openShifts.length}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting staff</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Applications</CardTitle>
              <Clock className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{pendingApplications.length}</div>
              <p className="text-xs text-gray-500 mt-1">Needs review</p>
            </CardContent>
          </Card>

          <Card className="border-green-100/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Shifts</CardTitle>
              <Calendar className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{shifts.length}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-teal-100/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Est. Spending</CardTitle>
              <DollarSign className="w-5 h-5 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(0)}</div>
              <p className="text-xs text-gray-500 mt-1">On staffing</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Shifts */}
          <div className="lg:col-span-2">
            <Card className="border-blue-100/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-gray-900">Recent Shifts</CardTitle>
                  <Link to={createPageUrl("ManageShifts")}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {shifts.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">You haven't posted any shifts yet</p>
                    <Link to={createPageUrl("PostShift")}>
                      <Button className="bg-gradient-to-r from-blue-600 to-teal-600">
                        Post Your First Shift
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shifts.slice(0, 5).map((shift) => (
                      <div key={shift.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{shift.title}</h3>
                          <Badge className={
                            shift.status === 'open' ? 'bg-green-100 text-green-700' :
                            shift.status === 'filled' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {shift.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(shift.shift_date), 'MMM d')}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${shift.hourly_rate}/hr
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {shift.positions_filled}/{shift.number_of_positions}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Applications */}
          <div>
            <Card className="border-purple-100/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No pending applications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApplications.slice(0, 5).map((app) => (
                      <div key={app.id} className="p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                        <p className="font-medium text-sm text-gray-900">New Application</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600">
                            Match: {app.match_score}%
                          </span>
                          <Link to={createPageUrl("ManageShifts")}>
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              Review
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}