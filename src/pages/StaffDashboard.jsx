
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Briefcase,
  Clock,
  CheckCircle,
  DollarSign,
  MapPin,
  Calendar,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import OnboardingChecklist from "../components/onboarding/OnboardingChecklist";

export default function StaffDashboard() {
  const [user, setUser] = React.useState(null);
  const [onboardingProgress, setOnboardingProgress] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load onboarding progress
      if (currentUser?.email) {
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

  const { data: applications = [] } = useQuery({
    queryKey: ['staff-applications', user?.email],
    queryFn: () => base44.entities.ShiftApplication.filter({ staff_email: user?.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({
      user_email: user?.email,
      status: 'unread'
    }, '-created_date', 5),
    enabled: !!user,
  });

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');
  const totalEarnings = acceptedApplications.reduce((sum, app) => sum + (app.shift_rate || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100/50 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Welcome Back, {user?.full_name || 'Healthcare Professional'}!
              </h1>
              <p className="text-gray-600 text-lg">Ready to find your next shift opportunity?</p>
              <p className="text-sm text-gray-500 mt-2">
                💡 <span className="font-semibold">Pro Tip:</span> Shifts fill fast! Enable notifications to get instant alerts for new opportunities.
              </p>
            </div>
            <Link to={createPageUrl("BrowseShifts")}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-500/30">
                <Briefcase className="w-5 h-5 mr-2" />
                Browse Available Shifts
              </Button>
            </Link>
          </div>
        </div>

        {/* Onboarding Checklist */}
        {onboardingProgress && onboardingProgress.onboarding_status !== 'completed' && (
          <OnboardingChecklist progress={onboardingProgress} userType="staff" />
        )}

        {/* Why Join Banner */}
        {applications.length === 0 && (
          <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <TrendingUp className="w-12 h-12 text-teal-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to the Future of Healthcare Staffing! 🎉</h3>
                  <p className="text-gray-700 mb-4">
                    You're now part of a platform addressing America's healthcare workforce crisis. Here's what makes us different:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Fill Shifts in Minutes</p>
                        <p className="text-xs text-gray-600">Get matched to opportunities instantly</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Work on Your Terms</p>
                        <p className="text-xs text-gray-600">Choose your schedule and location</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Competitive Pay</p>
                        <p className="text-xs text-gray-600">Earn more than traditional agencies</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-100/50 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Applications</CardTitle>
              <Clock className="w-5 h-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{pendingApplications.length}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
            </CardContent>
          </Card>

          <Card className="border-teal-100/50 hover:shadow-lg transition-all duration-300 hover:border-teal-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Confirmed Shifts</CardTitle>
              <CheckCircle className="w-5 h-5 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{acceptedApplications.length}</div>
              <p className="text-xs text-gray-500 mt-1">Ready to work</p>
            </CardContent>
          </Card>

          <Card className="border-green-100/50 hover:shadow-lg transition-all duration-300 hover:border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
              <DollarSign className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">From accepted shifts</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100/50 hover:shadow-lg transition-all duration-300 hover:border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Profile Match</CardTitle>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">85%</div>
              <p className="text-xs text-gray-500 mt-1">Complete your profile</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card className="border-blue-100/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-gray-900">Recent Applications</CardTitle>
                  <Link to={createPageUrl("MyApplications")}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">You haven't applied to any shifts yet</p>
                    <Link to={createPageUrl("BrowseShifts")}>
                      <Button className="bg-gradient-to-r from-blue-600 to-teal-600">
                        Find Shifts Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((app) => (
                      <div key={app.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">Shift Application</h3>
                          <Badge className={
                            app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }>
                            {app.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(app.applied_date), 'MMM d, yyyy')}
                          </span>
                          {app.distance_miles && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {app.distance_miles.toFixed(1)} miles away
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <Card className="border-purple-100/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No new notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notif.priority === 'urgent' ? 'bg-red-500' :
                            notif.priority === 'high' ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                          </div>
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
