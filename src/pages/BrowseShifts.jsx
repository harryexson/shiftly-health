
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar,
  Filter,
  Zap,
  Briefcase,
  TrendingUp, // Added for value proposition
  AlertTriangle // Added for market context banner
} from "lucide-react";
import { format } from "date-fns";
import ShiftCard from "../components/shifts/ShiftCard";
import ApplyShiftModal from "../components/shifts/ApplyShiftModal";

export default function BrowseShifts() {
  const [user, setUser] = React.useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShift, setSelectedShift] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['available-shifts'],
    queryFn: () => base44.entities.Shift.filter({ status: 'open' }, '-created_date'),
  });

  const { data: staffProfile } = useQuery({
    queryKey: ['staff-profile', user?.email],
    queryFn: () => base44.entities.StaffProfile.filter({ user_email: user?.email }),
    enabled: !!user,
    select: (data) => data[0],
  });

  // Enhanced filtering with experience requirement
  const filteredShifts = shifts.filter(shift => {
    // Text search
    if (searchTerm && 
        !shift.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !shift.city?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !shift.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Experience requirement filter
    if (shift.minimum_experience_years && staffProfile) {
      const staffExperience = staffProfile.years_experience || 0;
      if (staffExperience < shift.minimum_experience_years) {
        return false;
      }
    }
    
    return true;
  });

  const urgentShifts = filteredShifts.filter(s => s.urgent);
  const regularShifts = filteredShifts.filter(s => !s.urgent);

  const handleApply = (shift) => {
    if (!staffProfile) {
      alert("Please complete your staff profile before applying to shifts");
      return;
    }
    setSelectedShift(shift);
    setShowApplyModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100/50 p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Available Shifts
          </h1>
          <p className="text-gray-600">Find your next opportunity and apply instantly</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-700">
              <Clock className="w-3 h-3 mr-1" />
              Instant matching
            </Badge>
            <Badge className="bg-teal-100 text-teal-700">
              <Zap className="w-3 h-3 mr-1" />
              Get notified in 15 min
            </Badge>
            <Badge className="bg-purple-100 text-purple-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              Competitive pay
            </Badge>
          </div>
        </div>

        {/* Market Context Banner */}
        {shifts.length > 0 && (
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">High Demand Alert</p>
                  <p className="text-xs text-amber-700">
                    Healthcare facilities are experiencing a {shifts.filter(s => s.urgent).length > 0 ? 'critical' : 'significant'} shortage. 
                    Your skills are in high demand—apply now for the best opportunities!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filters */}
        <Card className="border-blue-100/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by title, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-400"
                />
              </div>
              <Button variant="outline" className="h-12 px-6 border-gray-200 hover:bg-blue-50">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-blue-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{filteredShifts.length}</div>
                <p className="text-sm text-gray-600 mt-1">Total Shifts</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{urgentShifts.length}</div>
                <p className="text-sm text-gray-600 mt-1">Urgent</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  ${Math.round(filteredShifts.reduce((sum, s) => sum + (s.hourly_rate || 0), 0) / filteredShifts.length || 0)}
                </div>
                <p className="text-sm text-gray-600 mt-1">Avg Rate/hr</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {filteredShifts.reduce((sum, s) => sum + (s.number_of_positions - s.positions_filled), 0)}
                </div>
                <p className="text-sm text-gray-600 mt-1">Open Positions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Shifts */}
        {urgentShifts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">Urgent Shifts</h2>
              <Badge className="bg-red-100 text-red-700">Immediate Need</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {urgentShifts.map((shift) => (
                <ShiftCard 
                  key={shift.id} 
                  shift={shift} 
                  onApply={() => handleApply(shift)}
                  staffProfile={staffProfile}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Shifts */}
        <div>
          {urgentShifts.length > 0 && (
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Available Shifts</h2>
          )}
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading shifts...</p>
            </div>
          ) : filteredShifts.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No shifts match your search</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularShifts.map((shift) => (
                <ShiftCard 
                  key={shift.id} 
                  shift={shift} 
                  onApply={() => handleApply(shift)}
                  staffProfile={staffProfile}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showApplyModal && selectedShift && (
        <ApplyShiftModal
          shift={selectedShift}
          staffProfile={staffProfile}
          onClose={() => setShowApplyModal(false)}
        />
      )}
    </div>
  );
}
