import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const currencyData = {
  USD: { symbol: '$', name: 'US Dollar', countries: ['United States'] },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', countries: ['Canada'] },
  EUR: { symbol: '€', name: 'Euro', countries: ['Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Ireland'] },
  GBP: { symbol: '£', name: 'British Pound', countries: ['United Kingdom'] }
};

export default function CurrencySelector({ value, onChange, label = "Currency" }) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-2">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(currencyData).map(([code, data]) => (
            <SelectItem key={code} value={code}>
              {data.symbol} {code} - {data.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { currencyData };