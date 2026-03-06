import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, CheckCircle, XCircle, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function MyApplications() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-applications', user?.email],
    queryFn: () => base44.entities.ShiftApplication.filter({ staff_email: user?.email }, '-created_date'),
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100/50 p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            My Applications
          </h1>
          <p className="text-gray-600">Track the status of all your shift applications</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : applications.length === 0 ? (
          <Card className="border-blue-100/50">
            <CardContent className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No applications yet</p>
              <p className="text-gray-400 text-sm mt-2">Start browsing shifts to apply</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="border-blue-100/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2">Shift Application</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {format(new Date(app.applied_date), 'MMM d, yyyy')}
                        </span>
                        {app.distance_miles && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {app.distance_miles.toFixed(1)} miles away
                          </span>
                        )}
                        {app.match_score && (
                          <Badge variant="outline" className="border-purple-200 text-purple-700">
                            {app.match_score}% Match
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={
                      app.status === 'accepted' 
                        ? 'bg-green-100 text-green-700 border border-green-300' :
                      app.status === 'pending' 
                        ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                      app.status === 'rejected'
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }>
                      {app.status === 'accepted' && <CheckCircle className="w-4 h-4 mr-1" />}
                      {app.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                      {app.status === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                {app.cover_letter && (
                  <CardContent>
                    <p className="text-sm text-gray-600">{app.cover_letter}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}