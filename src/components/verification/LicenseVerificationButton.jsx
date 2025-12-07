import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Loader2, CheckCircle } from "lucide-react";

const LICENSE_TYPES = [
  { value: "nursing", label: "Nursing License (RN/LPN/NP)" },
  { value: "medical", label: "Medical License (MD/DO)" },
  { value: "physician_assistant", label: "Physician Assistant" },
  { value: "therapist", label: "Therapist (PT/OT/ST)" },
  { value: "cna", label: "Certified Nursing Assistant" },
  { value: "pharmacy", label: "Pharmacy License" },
  { value: "other", label: "Other Healthcare License" }
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function LicenseVerificationButton({ staffEmail, onVerificationComplete }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    license_number: "",
    license_state: "",
    license_type: "nursing"
  });

  const verifyLicenseMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('getLicenseVerification', {
        staff_email: staffEmail,
        license_number: formData.license_number,
        license_state: formData.license_state,
        license_type: formData.license_type
      });
      return response;
    },
    onSuccess: () => {
      setOpen(false);
      setFormData({ license_number: "", license_state: "", license_type: "nursing" });
      if (onVerificationComplete) onVerificationComplete();
    }
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Shield className="w-4 h-4" />
        Verify License
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Automated License Verification
            </DialogTitle>
            <DialogDescription>
              Verify this staff member's professional license through Checkr's verification service
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>License Type *</Label>
              <Select
                value={formData.license_type}
                onValueChange={(value) => setFormData({ ...formData, license_type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LICENSE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>License Number *</Label>
              <Input
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                placeholder="Enter license number"
                className="mt-1"
              />
            </div>

            <div>
              <Label>License State *</Label>
              <Select
                value={formData.license_state}
                onValueChange={(value) => setFormData({ ...formData, license_state: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>How it works:</strong>
              </p>
              <ul className="text-xs text-blue-800 mt-2 space-y-1">
                <li>• Checkr will verify the license with state licensing boards</li>
                <li>• Results typically available within 24-48 hours</li>
                <li>• Staff will be notified of verification status automatically</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => verifyLicenseMutation.mutate()}
              disabled={
                !formData.license_number || 
                !formData.license_state || 
                verifyLicenseMutation.isPending
              }
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {verifyLicenseMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify License
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}