import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Filter,
  Briefcase,
  Globe,
  TrendingUp
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ShiftCard from "../components/shifts/ShiftCard";
import ApplyShiftModal from "../components/shifts/ApplyShiftModal";

const POSITION_TYPES = [
  "RN", "LPN", "CNA", "PCT", "Doctor", "Physician_Assistant", 
  "Nurse_Practitioner", "Physical_Therapist", "Occupational_Therapist",
  "Speech_Therapist", "Medical_Assistant", "Phlebotomist",
  "Respiratory_Therapist", "Radiologic_Technologist", "Surgical_Technologist",
  "Pharmacy_Technician", "DSP", "Caregiver", "Home_Health_Aide"
];

const SHIFT_TIMES = [
  { value: "day_7am_3pm", label: "Day (7AM - 3PM)" },
  { value: "evening_3pm_11pm", label: "Evening (3PM - 11PM)" },
  { value: "night_11pm_7am", label: "Night (11PM - 7AM)" },
  { value: "day_8am_4pm", label: "Day (8AM - 4PM)" },
  { value: "evening_4pm_12am", label: "Evening (4PM - 12AM)" },
  { value: "night_12am_8am", label: "Night (12AM - 8AM)" },
  { value: "flexible", label: "Flexible" }
];

export default function GlobalMarketplace() {
  const [user, setUser] = useState(null);
  const [regionSettings, setRegionSettings] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: "",
    positionType: "all",
    minPayRate: 0,
    maxPayRate: 200,
    shiftTime: "all",
    maxDistance: 50,
    city: "",
    state: "",
    zipCode: ""
  });
  const [selectedShift, setSelectedShift] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const userRegion = await base44.entities.RegionSettings.filter({ 
        user_email: currentUser.email 
      });
      if (userRegion.length > 0) {
        setRegionSettings(userRegion[0]);
      }
    };
    loadUser();
  }, []);

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['global-shifts', regionSettings?.region],
    queryFn: () => base44.entities.Shift.filter({ 
      status: 'open'
    }, '-created_date'),
    enabled: !!regionSettings,
  });

  const { data: staffProfile } = useQuery({
    queryKey: ['staff-profile', user?.email],
    queryFn: () => base44.entities.StaffProfile.filter({ user_email: user?.email }),
    enabled: !!user,
    select: (data) => data[0],
  });

  const getCurrencySymbol = () => {
    switch (regionSettings?.currency) {
      case 'USD': return '$';
      case 'CAD': return 'C$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return '$';
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredShifts = shifts.filter(shift => {
    // Search term
    if (filters.searchTerm && !shift.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !shift.city?.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }

    // Position type
    if (filters.positionType !== 'all' && shift.staff_type_required !== filters.positionType) {
      return false;
    }

    // Pay rate
    if (shift.hourly_rate < filters.minPayRate || shift.hourly_rate > filters.maxPayRate) {
      return false;
    }

    // Distance
    if (staffProfile?.latitude && staffProfile?.longitude && shift.latitude && shift.longitude) {
      const distance = calculateDistance(
        staffProfile.latitude, 
        staffProfile.longitude,
        shift.latitude,
        shift.longitude
      );
      if (distance > filters.maxDistance) {
        return false;
      }
    }

    // Location filters
    if (filters.city && shift.city?.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }
    if (filters.state && shift.state?.toLowerCase() !== filters.state.toLowerCase()) {
      return false;
    }

    return true;
  });

  const handleApply = (shift) => {
    if (!staffProfile) {
      alert("Please complete your staff profile before applying to shifts");
      return;
    }
    setSelectedShift(shift);
    setShowApplyModal(true);
  };

  if (!regionSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-blue-600 text-xl">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Global Shift Marketplace
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {regionSettings.country} • {regionSettings.currency}
                  </span>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 text-lg px-4 py-2">
                {filteredShifts.length} Available Shifts
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Title or city..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Position Type */}
                <div>
                  <Label htmlFor="position">Position Type</Label>
                  <Select
                    value={filters.positionType}
                    onValueChange={(value) => setFilters({...filters, positionType: value})}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      {POSITION_TYPES.map(pos => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pay Rate Range */}
                <div>
                  <Label>
                    Pay Rate: {getCurrencySymbol()}{filters.minPayRate} - {getCurrencySymbol()}{filters.maxPayRate}/hr
                  </Label>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label className="text-xs text-gray-600">Min: {getCurrencySymbol()}{filters.minPayRate}</Label>
                      <Slider
                        value={[filters.minPayRate]}
                        onValueChange={([value]) => setFilters({...filters, minPayRate: value})}
                        max={200}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Max: {getCurrencySymbol()}{filters.maxPayRate}</Label>
                      <Slider
                        value={[filters.maxPayRate]}
                        onValueChange={([value]) => setFilters({...filters, maxPayRate: value})}
                        max={200}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Shift Time */}
                <div>
                  <Label htmlFor="shift-time">Shift Time</Label>
                  <Select
                    value={filters.shiftTime}
                    onValueChange={(value) => setFilters({...filters, shiftTime: value})}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shifts</SelectItem>
                      {SHIFT_TIMES.map(shift => (
                        <SelectItem key={shift.value} value={shift.value}>{shift.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Distance */}
                <div>
                  <Label>Max Distance: {filters.maxDistance} miles</Label>
                  <Slider
                    value={[filters.maxDistance]}
                    onValueChange={([value]) => setFilters({...filters, maxDistance: value})}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter city..."
                      value={filters.city}
                      onChange={(e) => setFilters({...filters, city: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      placeholder="Enter state..."
                      value={filters.state}
                      onChange={(e) => setFilters({...filters, state: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input
                      id="zip"
                      placeholder="Enter ZIP..."
                      value={filters.zipCode}
                      onChange={(e) => setFilters({...filters, zipCode: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFilters({
                    searchTerm: "",
                    positionType: "all",
                    minPayRate: 0,
                    maxPayRate: 200,
                    shiftTime: "all",
                    maxDistance: 50,
                    city: "",
                    state: "",
                    zipCode: ""
                  })}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Shifts Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading shifts...</p>
              </div>
            ) : filteredShifts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No shifts match your filters</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredShifts.map((shift) => (
                  <ShiftCard 
                    key={shift.id} 
                    shift={shift} 
                    onApply={() => handleApply(shift)}
                    staffProfile={staffProfile}
                    currencySymbol={getCurrencySymbol()}
                  />
                ))}
              </div>
            )}
          </div>
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