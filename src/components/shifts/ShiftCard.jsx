import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar,
  Zap,
  Users,
  Award,
  Star,
  TrendingUp,
  CheckCircle,
  Target,
  Activity
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function ShiftCard({ shift, onApply, staffProfile, currencySymbol = '$' }) {
  const calculateAdvancedMatchScore = () => {
    if (!staffProfile) return 0;
    
    let score = 0;
    const weights = {
      staffType: 20,
      skillProximity: 25,
      historicalPerformance: 20,
      proximity: 15,
      shiftPreferences: 10,
      rate: 5,
      experience: 5
    };
    
    // 1. Staff Type Match (20 points)
    if (staffProfile.staff_type === shift.staff_type_required) {
      score += weights.staffType;
    }
    
    // 2. Skill Proximity Score (25 points) - NEW ENHANCED
    if (shift.required_qualifications && shift.required_qualifications.length > 0) {
      const staffQuals = staffProfile.qualifications || [];
      const matchedQuals = shift.required_qualifications.filter(req => 
        staffQuals.includes(req)
      );
      
      // Calculate skill proximity as percentage of required skills matched
      const skillMatchRatio = matchedQuals.length / shift.required_qualifications.length;
      
      // Also consider extra qualifications as bonus (up to 5 extra points)
      const extraQuals = staffQuals.filter(q => !shift.required_qualifications.includes(q));
      const bonusPoints = Math.min(5, extraQuals.length * 0.5);
      
      score += (skillMatchRatio * weights.skillProximity) + bonusPoints;
    } else {
      score += weights.skillProximity; // No specific requirements
    }
    
    // 3. Historical Performance Score (20 points) - NEW ENHANCED
    // Weight recent performance higher than older performance
    if (staffProfile.average_rating && staffProfile.total_ratings > 0) {
      // Base rating score (0-5 scale normalized to 0-15 points)
      const ratingScore = (staffProfile.average_rating / 5) * 15;
      
      // Reliability bonus (high reliability = up to 5 extra points)
      const reliabilityBonus = staffProfile.reliability_score 
        ? (staffProfile.reliability_score / 100) * 5 
        : 2.5; // Default mid-range if no data
      
      score += ratingScore + reliabilityBonus;
    } else {
      // New workers get 70% of max performance points
      score += weights.historicalPerformance * 0.7;
    }
    
    // 4. Proximity Score (15 points)
    if (staffProfile.latitude && staffProfile.longitude && shift.latitude && shift.longitude) {
      const distance = calculateDistance(
        staffProfile.latitude, 
        staffProfile.longitude,
        shift.latitude,
        shift.longitude
      );
      const maxCommute = staffProfile.shift_preferences?.max_commute_miles || 25;
      
      if (distance <= maxCommute) {
        const proximityScore = Math.max(0, 1 - (distance / maxCommute)) * weights.proximity;
        score += proximityScore;
      }
    } else {
      score += weights.proximity * 0.5;
    }
    
    // 5. Shift Preferences Match (10 points)
    if (staffProfile.shift_preferences) {
      let prefScore = 0;
      const prefs = staffProfile.shift_preferences;
      
      if (prefs.preferred_shift_times && prefs.preferred_shift_times.length > 0) {
        const shiftTime = getShiftTimeCategory(shift.start_time);
        if (prefs.preferred_shift_times.includes(shiftTime) || prefs.preferred_shift_times.includes('flexible')) {
          prefScore += 5;
        }
      } else {
        prefScore += 5;
      }
      
      if (shift.urgent && prefs.prefers_urgent_shifts) {
        prefScore += 3;
      } else if (!shift.urgent) {
        prefScore += 3;
      }
      
      const shiftDate = new Date(shift.shift_date);
      const isWeekend = shiftDate.getDay() === 0 || shiftDate.getDay() === 6;
      if (isWeekend && prefs.willing_to_work_weekends) {
        prefScore += 2;
      } else if (!isWeekend) {
        prefScore += 2;
      }
      
      score += prefScore;
    } else {
      score += weights.shiftPreferences * 0.7;
    }
    
    // 6. Rate Match (5 points)
    if (staffProfile.hourly_rate && shift.hourly_rate) {
      if (shift.hourly_rate >= staffProfile.hourly_rate) {
        score += weights.rate;
      } else {
        score += (shift.hourly_rate / staffProfile.hourly_rate) * weights.rate;
      }
    } else {
      score += weights.rate * 0.5;
    }
    
    // 7. Experience Match (5 points) - NEW
    if (shift.minimum_experience_years) {
      const staffExperience = staffProfile.years_experience || 0;
      if (staffExperience >= shift.minimum_experience_years) {
        score += weights.experience;
      } else {
        // Partial credit if close to requirement
        const experienceRatio = staffExperience / shift.minimum_experience_years;
        score += experienceRatio * weights.experience;
      }
    } else {
      score += weights.experience;
    }
    
    // Bonus points for exceptional profiles
    if (staffProfile.reliability_score && staffProfile.reliability_score >= 95) {
      score += 3; // High reliability bonus
    }
    
    if (staffProfile.total_shifts_completed > 100) {
      score += 3; // Extensive experience bonus
    }
    
    if (staffProfile.average_rating && staffProfile.average_rating >= 4.8) {
      score += 2; // Exceptional rating bonus
    }
    
    return Math.min(100, Math.round(score));
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

  const getShiftTimeCategory = (startTime) => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 6 && hour < 14) return 'day';
    if (hour >= 14 && hour < 22) return 'evening';
    return 'night';
  };

  const matchScore = calculateAdvancedMatchScore();
  
  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'from-emerald-500 to-green-500';
    if (score >= 75) return 'from-blue-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const getMatchScoreLabel = (score) => {
    if (score >= 90) return 'Perfect Match';
    if (score >= 75) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Potential Match';
  };

  // Calculate skill proximity display
  const getSkillProximity = () => {
    if (!staffProfile || !shift.required_qualifications || shift.required_qualifications.length === 0) {
      return null;
    }
    
    const staffQuals = staffProfile.qualifications || [];
    const matchedQuals = shift.required_qualifications.filter(req => staffQuals.includes(req));
    const matchPercentage = Math.round((matchedQuals.length / shift.required_qualifications.length) * 100);
    
    return {
      matched: matchedQuals.length,
      total: shift.required_qualifications.length,
      percentage: matchPercentage
    };
  };

  const skillProximity = getSkillProximity();

  // Check experience requirement
  const meetsExperienceRequirement = () => {
    if (!shift.minimum_experience_years || !staffProfile) return true;
    const staffExperience = staffProfile.years_experience || 0;
    return staffExperience >= shift.minimum_experience_years;
  };

  const experienceMet = meetsExperienceRequirement();

  return (
    <Card className={`border-2 hover:shadow-xl transition-all duration-300 ${
      shift.urgent 
        ? 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50' 
        : matchScore >= 90 
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50'
          : matchScore >= 75
            ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-teal-50'
            : 'border-blue-100 hover:border-blue-300'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-gray-900 flex-1">{shift.title}</h3>
          <div className="flex gap-2">
            {shift.urgent && (
              <Badge className="bg-red-500 text-white">
                <Zap className="w-3 h-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>
        </div>
        
        {staffProfile && matchScore > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">
                {matchScore}% - {getMatchScoreLabel(matchScore)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${getMatchScoreColor(matchScore)} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${matchScore}%` }}
                />
              </div>
            </div>
            
            {/* Match Breakdown */}
            <div className="flex flex-wrap gap-2 mt-2">
              {staffProfile.staff_type === shift.staff_type_required && (
                <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  License Match
                </Badge>
              )}
              
              {skillProximity && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    skillProximity.percentage === 100 
                      ? 'border-emerald-300 text-emerald-700 bg-emerald-50' 
                      : skillProximity.percentage >= 75
                        ? 'border-blue-300 text-blue-700 bg-blue-50'
                        : 'border-amber-300 text-amber-700 bg-amber-50'
                  }`}
                >
                  <Activity className="w-3 h-3 mr-1" />
                  {skillProximity.percentage}% Skills Match
                </Badge>
              )}
              
              {staffProfile.average_rating >= 4.5 && (
                <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Top Rated
                </Badge>
              )}
              
              {staffProfile.reliability_score >= 90 && (
                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Highly Reliable
                </Badge>
              )}
              
              {staffProfile.total_shifts_completed > 50 && (
                <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                  <Award className="w-3 h-3 mr-1" />
                  Experienced ({staffProfile.total_shifts_completed}+ shifts)
                </Badge>
              )}
              
              {shift.minimum_experience_years && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    experienceMet 
                      ? 'border-green-300 text-green-700 bg-green-50' 
                      : 'border-red-300 text-red-700 bg-red-50'
                  }`}
                >
                  <Award className="w-3 h-3 mr-1" />
                  {experienceMet ? '✓' : '✗'} {shift.minimum_experience_years}+ yrs required
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm line-clamp-2">{shift.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm">{shift.city}, {shift.state}</span>
            {staffProfile?.latitude && shift.latitude && (
              <Badge variant="outline" className="ml-auto text-xs">
                {calculateDistance(
                  staffProfile.latitude,
                  staffProfile.longitude,
                  shift.latitude,
                  shift.longitude
                ).toFixed(1)} mi away
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-teal-500" />
            <span className="text-sm font-medium">
              {format(new Date(shift.shift_date), 'MMM d, yyyy')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm">{shift.start_time} - {shift.end_time}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm font-bold text-green-600">
              {currencySymbol}{shift.hourly_rate}/hour
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4 text-orange-500" />
            <span className="text-sm">
              {shift.positions_filled}/{shift.number_of_positions} positions filled
            </span>
          </div>
        </div>

        {shift.required_qualifications && shift.required_qualifications.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-medium text-gray-600 mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-1">
              {shift.required_qualifications.map((qual, idx) => {
                const hasQual = staffProfile?.qualifications?.includes(qual);
                return (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className={`text-xs ${hasQual ? 'border-green-300 text-green-700 bg-green-50' : 'border-blue-200 text-blue-700'}`}
                  >
                    {hasQual && <CheckCircle className="w-3 h-3 mr-1" />}
                    {qual}
                  </Badge>
                );
              })}
            </div>
            
            {skillProximity && skillProximity.percentage < 100 && (
              <p className="text-xs text-amber-700 mt-2">
                ⚠️ You match {skillProximity.matched} of {skillProximity.total} required skills
              </p>
            )}
          </div>
        )}

        {!experienceMet && shift.minimum_experience_years && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700">
              <strong>⚠️ Experience Requirement:</strong> This shift requires {shift.minimum_experience_years}+ years of experience. 
              {staffProfile?.years_experience 
                ? ` You have ${staffProfile.years_experience} years.`
                : ' Please update your profile with your experience.'}
            </p>
          </div>
        )}

        <Button 
          onClick={onApply}
          disabled={!experienceMet}
          className={`w-full ${
            !experienceMet
              ? 'bg-gray-400 cursor-not-allowed'
              : matchScore >= 90
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                : shift.urgent 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                  : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700'
          } shadow-lg`}
        >
          {!experienceMet ? 'Experience Requirement Not Met' : 'Apply Now'}
        </Button>
      </CardContent>
    </Card>
  );
}