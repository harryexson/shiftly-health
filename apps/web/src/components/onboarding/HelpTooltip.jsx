import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HelpCircle, X } from "lucide-react";

export default function HelpTooltip({ title, content, placement = "top" }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full hover:bg-blue-100"
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4" 
        side={placement}
        sideOffset={5}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
      </PopoverContent>
    </Popover>
  );
}