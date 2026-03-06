import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Briefcase, 
  Users, 
  Clock, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  Calendar,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

export default function FacilityOverview({ user, shifts, applications, employerProfile }) {
  const openShifts = shifts.filter(s => s.status === 'open');
  const filledShifts = shifts.filter(s => s.status === 'filled');
  const pendingApplications = applications.filter(a => a.status === 'pending');
  const acceptedApplications = applications.filter(a => a.status === 'accepted');
  
  const totalSpent = shifts.reduce((sum, s) => {
    if (s.status === 'completed' || s.status === 'filled') {
      const hours = 8; // Assume 8 hour shifts
      return sum + (s.hourly_rate * hours * s.positions_filled);
    }
    return sum;
  }, 0);

  const avgFillRate = shifts.length > 0 
    ? Math.round((filledShifts.length / shifts.length) * 100) 
    : 0;

  const urgentShifts = openShifts.filter(s => s.urgent);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link to={createPageUrl("PostShift")}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6 text-center">
              <Plus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-blue-900">Post New Shift</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl("ShiftTemplates")}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6 text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold text-purple-900">Shift Templates</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl("Messages")}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <p className="font-semibold text-teal-900">Message Staff</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl("MarketAnalysis")}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="font-semibold text-orange-900">Market Analysis</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Alerts */}
      {(urgentShifts.length > 0 || pendingApplications.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {urgentShifts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">{urgentShifts.length} Urgent Shifts Need Staff</h3>
                    <p className="text-sm text-red-700 mt-1">These shifts are marked urgent and need immediate attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {pendingApplications.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900">{pendingApplications.length} Applications Pending Review</h3>
                    <p className="text-sm text-amber-700 mt-1">Review applications to fill your open shifts faster</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              Open Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{openShifts.length}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting staff</p>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Filled Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{filledShifts.length}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully staffed</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Hired Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{acceptedApplications.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total hires</p>
          </CardContent>
        </Card>

        <Card className="border-teal-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              Fill Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{avgFillRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Recent Shifts
              <Link to={createPageUrl("ManageShifts")}>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shifts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No shifts posted yet</p>
            ) : (
              <div className="space-y-3">
                {shifts.slice(0, 5).map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{shift.title}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(shift.shift_date), 'MMM d')} • ${shift.hourly_rate}/hr
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {shift.urgent && <Badge className="bg-red-100 text-red-700">Urgent</Badge>}
                      <Badge className={
                        shift.status === 'open' ? 'bg-green-100 text-green-700' :
                        shift.status === 'filled' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {shift.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending applications</p>
            ) : (
              <div className="space-y-3">
                {pendingApplications.slice(0, 5).map((app) => {
                  const shift = shifts.find(s => s.id === app.shift_id);
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{shift?.title || 'Shift'}</p>
                        <p className="text-sm text-gray-600">
                          Match: {app.match_score}% • {app.distance_miles?.toFixed(1) || '?'} mi away
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}