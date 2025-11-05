import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function Billing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Billing & Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage your subscription and billing information</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}