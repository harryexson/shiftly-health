import React from "react";

export default function Logo({ size = "default", showText = true, className = "" }) {
  const sizes = {
    small: { icon: 24, text: "text-lg" },
    default: { icon: 32, text: "text-xl" },
    large: { icon: 48, text: "text-2xl" },
    xlarge: { icon: 64, text: "text-3xl" }
  };

  const { icon, text } = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Shiftly Health Logo - Medical Cross with Hand */}
      <svg 
        width={icon} 
        height={icon} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Main cross shape with gradient */}
        <defs>
          <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="handGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        
        {/* Top part of cross */}
        <rect x="20" y="4" width="24" height="24" rx="6" fill="url(#crossGradient)" />
        
        {/* Bottom part of cross with hand */}
        <rect x="4" y="24" width="56" height="28" rx="6" fill="url(#handGradient)" />
        
        {/* Hand/arrow lines */}
        <path 
          d="M12 34 L28 34" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        <path 
          d="M12 40 L24 40" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        <path 
          d="M12 46 L20 46" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        
        {/* Arrow pointing right */}
        <path 
          d="M32 40 L44 40 M40 34 L46 40 L40 46" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {showText && (
        <span className={`font-bold ${text} bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent`}>
          Shiftly Health
        </span>
      )}
    </div>
  );
}