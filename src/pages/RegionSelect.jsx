import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, DollarSign } from "lucide-react";

const REGIONS = [
  {
    code: "USA",
    name: "United States",
    currency: "USD",
    symbol: "$",
    flag: "🇺🇸",
    description: "Serving healthcare facilities across all 50 states"
  },
  {
    code: "Canada",
    name: "Canada",
    currency: "CAD",
    symbol: "C$",
    flag: "🇨🇦",
    description: "Supporting healthcare providers from coast to coast"
  },
  {
    code: "United_Kingdom",
    name: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    flag: "🇬🇧",
    description: "Connecting NHS and private healthcare facilities"
  },
  {
    code: "Europe",
    name: "Europe",
    currency: "EUR",
    symbol: "€",
    flag: "🇪🇺",
    description: "Operating across European healthcare markets"
  }
];

export default function RegionSelect() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Check if user already has region set
        const regionSettings = await base44.entities.RegionSettings.filter({ 
          user_email: currentUser.email 
        });
        
        if (regionSettings.length > 0) {
          navigate(createPageUrl("Welcome"));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

  const saveRegionMutation = useMutation({
    mutationFn: async (region) => {
      const regionData = REGIONS.find(r => r.code === region);
      
      await base44.entities.RegionSettings.create({
        user_email: user.email,
        region: region,
        country: regionData.name,
        currency: regionData.currency,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: "en",
        date_format: region === "USA" ? "MM/DD/YYYY" : "DD/MM/YYYY"
      });
    },
    onSuccess: () => {
      navigate(createPageUrl("Welcome"));
    },
  });

  const handleRegionSelect = (regionCode) => {
    saveRegionMutation.mutate(regionCode);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="animate-pulse text-blue-600 text-xl font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <Globe className="w-20 h-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Select Your Region
          </h1>
          <p className="text-xl text-gray-600">
            Choose where you'll be using HealthStaff Connect
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REGIONS.map((region) => (
            <Card 
              key={region.code}
              className={`border-2 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 cursor-pointer group ${
                selectedRegion === region.code ? 'border-blue-500 shadow-xl' : 'border-blue-100'
              }`}
              onClick={() => setSelectedRegion(region.code)}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4">{region.flag}</div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {region.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">{region.currency} ({region.symbol})</span>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {region.description}
                </p>
                <Button
                  onClick={() => handleRegionSelect(region.code)}
                  disabled={saveRegionMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  {saveRegionMutation.isPending && selectedRegion === region.code ? 'Setting Up...' : 'Select Region'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Note:</span> Your region selection determines your currency, available shifts, and subscription pricing. 
                You can browse and work with facilities in your selected region.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}