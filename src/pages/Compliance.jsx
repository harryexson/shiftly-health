import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Compliance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Compliance Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Track and manage compliance records</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}