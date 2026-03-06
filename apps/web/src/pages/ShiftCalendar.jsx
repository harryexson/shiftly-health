import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Briefcase,
  Users,
  Clock
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function ShiftCalendar() {
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: shifts = [] } = useQuery({
    queryKey: ['calendar-shifts', user?.email, format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      
      return await base44.entities.Shift.filter({
        employer_email: user.email,
        shift_date: { $gte: start, $lte: end }
      }, 'shift_date');
    },
    enabled: !!user,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['calendar-applications', user?.email, format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const shiftIds = shifts.map(s => s.id);
      if (shiftIds.length === 0) return [];
      
      return await base44.entities.ShiftApplication.filter({
        shift_id: { $in: shiftIds }
      });
    },
    enabled: !!user && shifts.length > 0,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getShiftsForDate = (date) => {
    return shifts.filter(shift => 
      isSameDay(new Date(shift.shift_date), date)
    );
  };

  const getApplicationsForShift = (shiftId) => {
    return applications.filter(app => app.shift_id === shiftId);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <CalendarIcon className="w-7 h-7 text-blue-600" />
                  Shift Calendar
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  View and manage your shifts in calendar format
                </p>
              </div>
              <Link to={createPageUrl("PostShift")}>
                <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Shift
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Navigation */}
        <Card className="border-blue-100/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <Button 
                  variant="link" 
                  onClick={today}
                  className="text-sm text-blue-600"
                >
                  Today
                </Button>
              </div>
              
              <Button variant="outline" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Weekday Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day, idx) => {
                const dayShifts = getShiftsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-24 p-2 rounded-lg border-2 transition-all cursor-pointer ${
                      !isCurrentMonth 
                        ? 'bg-gray-50 text-gray-400 border-gray-100' 
                        : isSelected
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold ${
                        isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {dayShifts.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {dayShifts.length}
                        </Badge>
                      )}
                    </div>

                    {isCurrentMonth && dayShifts.length > 0 && (
                      <div className="space-y-1">
                        {dayShifts.slice(0, 2).map((shift) => {
                          const shiftApps = getApplicationsForShift(shift.id);
                          const isFilled = shift.positions_filled >= shift.number_of_positions;

                          return (
                            <div
                              key={shift.id}
                              className={`text-xs p-1 rounded truncate ${
                                isFilled 
                                  ? 'bg-green-100 text-green-700'
                                  : shift.urgent
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              <div className="font-semibold truncate">{shift.title}</div>
                              <div className="text-xs opacity-75">
                                {shift.start_time} • {shift.positions_filled}/{shift.number_of_positions}
                              </div>
                            </div>
                          );
                        })}
                        {dayShifts.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayShifts.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        {selectedDate && (
          <Card className="border-blue-100/50">
            <CardHeader>
              <CardTitle>
                Shifts for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getShiftsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No shifts scheduled for this day</p>
                  <Link to={createPageUrl("PostShift")}>
                    <Button className="mt-4" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Post a Shift
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {getShiftsForDate(selectedDate).map((shift) => {
                    const shiftApps = getApplicationsForShift(shift.id);
                    const pendingApps = shiftApps.filter(a => a.status === 'pending').length;

                    return (
                      <Card key={shift.id} className="border-blue-100">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h4 className="font-bold text-lg">{shift.title}</h4>
                                {shift.urgent && (
                                  <Badge className="bg-red-500">Urgent</Badge>
                                )}
                                <Badge className={
                                  shift.status === 'filled' 
                                    ? 'bg-green-500'
                                    : 'bg-blue-500'
                                }>
                                  {shift.status}
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-600" />
                                  <span>{shift.start_time} - {shift.end_time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-600" />
                                  <span>
                                    {shift.positions_filled}/{shift.number_of_positions} positions filled
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Rate:</span>
                                  <span className="ml-2 font-semibold">${shift.hourly_rate}/hr</span>
                                </div>
                                {pendingApps > 0 && (
                                  <div>
                                    <Badge variant="outline" className="text-amber-700 border-amber-300">
                                      {pendingApps} pending application{pendingApps > 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Link to={createPageUrl("ManageShifts")}>
                              <Button variant="outline" size="sm">
                                Manage
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}