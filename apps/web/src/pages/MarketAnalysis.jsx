import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  BarChart3,
  FileText,
  Loader2
} from "lucide-react";

export default function MarketAnalysis() {
  const [user, setUser] = useState(null);
  const [downloading, setDownloading] = useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: shifts = [] } = useQuery({
    queryKey: ['market-shifts'],
    queryFn: () => base44.entities.Shift.filter({}),
  });

  const { data: staffProfiles = [] } = useQuery({
    queryKey: ['market-staff'],
    queryFn: () => base44.entities.StaffProfile.filter({}),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['market-applications'],
    queryFn: () => base44.entities.ShiftApplication.filter({}),
  });

  // Calculate statistics
  const calcRateStats = (type) => {
    const rates = shifts.filter(s => s.staff_type_required === type).map(s => s.hourly_rate).filter(Boolean);
    if (rates.length === 0) return { min: 0, max: 0, avg: 0 };
    return {
      min: Math.min(...rates),
      max: Math.max(...rates),
      avg: Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100) / 100
    };
  };

  const licensedStats = calcRateStats('licensed');
  const dspStats = calcRateStats('unlicensed_dsp');
  const caregiverStats = calcRateStats('unlicensed_caregiver');

  const fillRate = applications.length > 0 
    ? Math.round((applications.filter(a => a.status === 'accepted').length / applications.length) * 100) 
    : 0;

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await base44.functions.invoke('generateMarketReport', {}, {
        responseType: 'arraybuffer'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `market-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <BarChart3 className="w-7 h-7 text-blue-600" />
                  Market Analysis & Pricing
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Real-time market insights and competitive pricing data
                </p>
              </div>
              <Button 
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Report
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-blue-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{shifts.length}</p>
                  <p className="text-sm text-gray-600">Total Shifts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <Users className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{staffProfiles.length}</p>
                  <p className="text-sm text-gray-600">Active Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{fillRate}%</p>
                  <p className="text-sm text-gray-600">Fill Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${licensedStats.avg || 0}</p>
                  <p className="text-sm text-gray-600">Avg Rate/hr</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Table */}
        <Card className="border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Competitive Pricing by Staff Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                    <th className="text-left p-4 rounded-tl-lg">Staff Type</th>
                    <th className="text-center p-4">Min Rate</th>
                    <th className="text-center p-4">Max Rate</th>
                    <th className="text-center p-4">Avg Rate</th>
                    <th className="text-center p-4 rounded-tr-lg">Recommended</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700">Licensed</Badge>
                        RN / LPN / NP
                      </div>
                    </td>
                    <td className="text-center p-4">${licensedStats.min.toFixed(2)}</td>
                    <td className="text-center p-4">${licensedStats.max.toFixed(2)}</td>
                    <td className="text-center p-4 font-bold text-green-600">${licensedStats.avg.toFixed(2)}</td>
                    <td className="text-center p-4">
                      <Badge className="bg-green-100 text-green-700">
                        ${Math.round(licensedStats.avg * 1.05)} - ${Math.round(licensedStats.avg * 1.15)}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-700">DSP</Badge>
                        Direct Support Professional
                      </div>
                    </td>
                    <td className="text-center p-4">${dspStats.min.toFixed(2)}</td>
                    <td className="text-center p-4">${dspStats.max.toFixed(2)}</td>
                    <td className="text-center p-4 font-bold text-green-600">${dspStats.avg.toFixed(2)}</td>
                    <td className="text-center p-4">
                      <Badge className="bg-green-100 text-green-700">
                        ${Math.round(dspStats.avg * 1.05)} - ${Math.round(dspStats.avg * 1.15)}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-teal-100 text-teal-700">Caregiver</Badge>
                        CNA / Home Health Aide
                      </div>
                    </td>
                    <td className="text-center p-4">${caregiverStats.min.toFixed(2)}</td>
                    <td className="text-center p-4">${caregiverStats.max.toFixed(2)}</td>
                    <td className="text-center p-4 font-bold text-green-600">${caregiverStats.avg.toFixed(2)}</td>
                    <td className="text-center p-4">
                      <Badge className="bg-green-100 text-green-700">
                        ${Math.round(caregiverStats.avg * 1.05)} - ${Math.round(caregiverStats.avg * 1.15)}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Market Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-blue-100/50">
            <CardHeader>
              <CardTitle className="text-lg">Pricing Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>💡 Weekend/Holiday Premium:</strong> Add 15-20% to base rates for weekend and holiday shifts
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-900">
                  <strong>🌙 Night Shift Premium:</strong> Night shifts typically warrant 10-15% higher rates
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-900">
                  <strong>⚡ Urgent Shift Premium:</strong> Last-minute shifts can command 20-25% premium
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100/50">
            <CardHeader>
              <CardTitle className="text-lg">Market Demand Signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Open Positions</span>
                <Badge className="bg-blue-500">{shifts.filter(s => s.status === 'open').length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Urgent Shifts</span>
                <Badge className="bg-red-500">{shifts.filter(s => s.urgent).length}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Avg Applications/Shift</span>
                <Badge className="bg-green-500">
                  {shifts.length > 0 ? Math.round(applications.length / shifts.length) : 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Verified Staff Available</span>
                <Badge className="bg-teal-500">
                  {staffProfiles.filter(s => s.verification_status === 'verified').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download CTA */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <FileText className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    Download Full Market Report
                  </h3>
                  <p className="text-gray-600">
                    Get a comprehensive PDF with pricing analysis, market trends, and recommendations
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDownloadPDF}
                disabled={downloading}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}