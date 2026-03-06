import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  User, 
  Building2, 
  Copy,
  CheckCircle,
  MapPin,
  Briefcase,
  Heart
} from "lucide-react";

export default function TestCredentials() {
  const [copiedEmail, setCopiedEmail] = React.useState("");

  const copyToClipboard = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              Test User Credentials - South Bend, IN
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Use these test accounts to explore the HealthStaff Connect platform. All profiles and shifts are pre-configured for the South Bend, Indiana area.
            </p>
          </CardHeader>
        </Card>

        {/* Quick Start Instructions */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Quick Start Guide
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
              <li>Click "Copy Email" on any test account below</li>
              <li>Sign up using that email address (use any password you want)</li>
              <li>Complete your profile setup if prompted</li>
              <li>Explore the platform with pre-loaded sample data</li>
            </ol>
          </CardContent>
        </Card>

        {/* Healthcare Facilities */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Healthcare Facilities (Employers)
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-blue-200 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-blue-900">Memorial Hospital of South Bend</CardTitle>
                    <Badge className="mt-2 bg-blue-600 text-white">Premium Plan • Hospital</Badge>
                  </div>
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Test Email:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                      memorial.hospital.sb@test.com
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard("memorial.hospital.sb@test.com")}
                      className="shrink-0"
                    >
                      {copiedEmail === "memorial.hospital.sb@test.com" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>615 N Michigan St, South Bend, IN 46601</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Contact: Dr. Jennifer Williams</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>350+ beds • Emergency Services • Specialty Care</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Available Shift:</p>
                  <p className="text-sm text-blue-800">🚨 Emergency Department RN - Night Shift (URGENT)</p>
                  <p className="text-xs text-blue-700 mt-1">$48.00/hr • 2 positions open</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-teal-200 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-teal-900">Harmony Senior Living Center</CardTitle>
                    <Badge className="mt-2 bg-teal-600 text-white">Basic Plan • Nursing Home</Badge>
                  </div>
                  <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Test Email:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                      harmony.senior.sb@test.com
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard("harmony.senior.sb@test.com")}
                      className="shrink-0"
                    >
                      {copiedEmail === "harmony.senior.sb@test.com" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>1234 Cleveland Rd, South Bend, IN 46628</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-teal-600" />
                    <span>Contact: Linda Patterson</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Heart className="w-4 h-4 text-teal-600" />
                    <span>24/7 Skilled Nursing • Assisted Living</span>
                  </div>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                  <p className="text-xs font-semibold text-teal-900 mb-1">Available Shift:</p>
                  <p className="text-sm text-teal-800">CNA - Morning Shift at Senior Living</p>
                  <p className="text-xs text-teal-700 mt-1">$19.50/hr • 1 position open</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Healthcare Professionals */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-7 h-7 text-purple-600" />
            Healthcare Professionals (Staff/Gig Workers)
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-purple-200 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-purple-900">Sarah Johnson</CardTitle>
                    <Badge className="mt-2 bg-purple-600 text-white">Certified Nursing Assistant (CNA)</Badge>
                  </div>
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    SJ
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Test Email:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                      sarah.johnson.cna@test.com
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard("sarah.johnson.cna@test.com")}
                      className="shrink-0"
                    >
                      {copiedEmail === "sarah.johnson.cna@test.com" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>456 Oak Street, South Bend, IN 46617</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    <span>4 years experience • Desired Rate: $18.50/hr</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline" className="text-xs">CPR</Badge>
                    <Badge variant="outline" className="text-xs">First Aid</Badge>
                    <Badge variant="outline" className="text-xs">Feeding</Badge>
                    <Badge variant="outline" className="text-xs">Bathing</Badge>
                    <Badge variant="outline" className="text-xs">Grooming</Badge>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-xs font-semibold text-purple-900 mb-1">Profile Status:</p>
                  <p className="text-sm text-purple-800">✅ Verified & Active</p>
                  <p className="text-xs text-purple-700 mt-1">Ready to apply for shifts</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-green-900">Michael Chen, RN</CardTitle>
                    <Badge className="mt-2 bg-green-600 text-white">Registered Nurse • Emergency Care</Badge>
                  </div>
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    MC
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Test Email:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                      michael.chen.rn@test.com
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard("michael.chen.rn@test.com")}
                      className="shrink-0"
                    >
                      {copiedEmail === "michael.chen.rn@test.com" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span>789 Maple Avenue, South Bend, IN 46614</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <span>7 years experience • Desired Rate: $42.00/hr</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>License: RN-IN-845621 (Valid until 12/31/2026)</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline" className="text-xs">CPR</Badge>
                    <Badge variant="outline" className="text-xs">ACLS</Badge>
                    <Badge variant="outline" className="text-xs">BLS</Badge>
                    <Badge variant="outline" className="text-xs">IV Therapy</Badge>
                    <Badge variant="outline" className="text-xs">Emergency Care</Badge>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs font-semibold text-green-900 mb-1">Profile Status:</p>
                  <p className="text-sm text-green-800">✅ Verified & Active</p>
                  <p className="text-xs text-green-700 mt-1">Perfect match for ED shift!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Notes */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Important Notes
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-amber-800">
              <li><strong>Password:</strong> Use any password when signing up - the system will create your account with the test email</li>
              <li><strong>GPS Proximity:</strong> All test accounts are within 5 miles of each other in South Bend, IN</li>
              <li><strong>Shifts Ready:</strong> 2 open shifts are available for immediate application</li>
              <li><strong>Matching:</strong> Michael Chen is a perfect match (95%+) for the Memorial Hospital ED shift</li>
              <li><strong>Payment Testing:</strong> Payroll and instant pay features are ready for testing (no real money transactions)</li>
              <li><strong>Region:</strong> All accounts are set to USA region with USD currency</li>
            </ul>
          </CardContent>
        </Card>

        {/* Test Scenarios */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl">Recommended Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">👩‍⚕️ Staff Workflow</h4>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                  <li>Login as Sarah or Michael</li>
                  <li>Browse shifts in Global Marketplace</li>
                  <li>Apply to matching shifts</li>
                  <li>View applications in "My Applications"</li>
                  <li>Check Instant Pay for earnings</li>
                </ol>
              </div>
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <h4 className="font-semibold text-teal-900 mb-2">🏥 Employer Workflow</h4>
                <ol className="list-decimal list-inside text-sm text-teal-800 space-y-1">
                  <li>Login as Memorial or Harmony</li>
                  <li>View posted shifts</li>
                  <li>Review incoming applications</li>
                  <li>Accept qualified candidates</li>
                  <li>Manage shift schedules</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}