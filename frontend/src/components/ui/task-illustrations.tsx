import React from "react";

export const VQAIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Satellite background & orbit grid */}
    <rect width="200" height="120" rx="6" fill="#0f172a" />
    <path d="M0 40H200M0 80H200M50 0V120M100 0V120M150 0V120" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
    
    {/* Landmass / Terrain terrain patch */}
    <path d="M20 75C40 60 70 85 100 70C130 55 160 80 180 65V110H20V75Z" fill="#1e3a8a" fillOpacity="0.4" />
    <path d="M40 90C60 80 80 95 110 85C140 75 165 90 180 80V115H40V90Z" fill="#0284c7" fillOpacity="0.3" />

    {/* Q&A Dialog Bubble Overlay */}
    <rect x="25" y="16" width="150" height="34" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.2" />
    <circle cx="42" cy="33" r="7" fill="#3b82f6" fillOpacity="0.2" />
    <circle cx="42" cy="33" r="3" fill="#3b82f6" />
    <rect x="56" y="27" width="70" height="4" rx="2" fill="#93c5fd" />
    <rect x="56" y="35" width="45" height="3" rx="1.5" fill="#64748b" />
    
    {/* Pulse Sensor Beacon */}
    <circle cx="140" cy="85" r="14" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
    <circle cx="140" cy="85" r="4" fill="#3b82f6" />
  </svg>
);

export const CaptioningIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Background */}
    <rect width="200" height="120" rx="6" fill="#064e3b" fillOpacity="0.3" />
    <rect width="200" height="120" rx="6" fill="#0f172a" fillOpacity="0.9" />
    
    {/* Terrain layers */}
    <path d="M0 60Q50 40 100 65T200 50V120H0Z" fill="#065f46" fillOpacity="0.35" />
    <path d="M0 80Q60 70 120 85T200 75V120H0Z" fill="#047857" fillOpacity="0.25" />

    {/* Structured Text Lines / Document Card */}
    <rect x="30" y="15" width="140" height="74" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="1.2" />
    <rect x="44" y="26" width="30" height="5" rx="2" fill="#34d399" />
    <rect x="44" y="38" width="112" height="4" rx="2" fill="#e2e8f0" />
    <rect x="44" y="47" width="95" height="4" rx="2" fill="#94a3b8" />
    <rect x="44" y="56" width="105" height="4" rx="2" fill="#94a3b8" />
    <rect x="44" y="65" width="65" height="4" rx="2" fill="#64748b" />
    
    {/* Verified Green Badge */}
    <circle cx="150" cy="28" r="6" fill="#10b981" />
    <path d="M147 28L149 30L153 26" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const GroundingIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Dark base */}
    <rect width="200" height="120" rx="6" fill="#0f172a" />
    
    {/* Coordinate grid */}
    <path d="M0 30H200M0 60H200M0 90H200M40 0V120M80 0V120M120 0V120M160 0V120" stroke="#1e293b" strokeWidth="0.8" />

    {/* Attention Bounding Box 1 */}
    <rect x="45" y="25" width="65" height="48" rx="4" fill="#f59e0b" fillOpacity="0.12" stroke="#f59e0b" strokeWidth="1.5" />
    <rect x="45" y="16" width="46" height="9" rx="2" fill="#f59e0b" />
    <text x="48" y="23" fill="#000000" fontSize="6.5" fontWeight="bold" fontFamily="monospace">BBOX [1]</text>
    
    {/* Attention Bounding Box 2 */}
    <rect x="125" y="52" width="50" height="42" rx="4" fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 2" />
    <rect x="125" y="45" width="44" height="8" rx="2" fill="#d97706" />
    <text x="128" y="51" fill="#ffffff" fontSize="6" fontWeight="bold" fontFamily="monospace">LOC_TARGET</text>

    {/* Crosshair Target */}
    <circle cx="77" cy="49" r="6" stroke="#f59e0b" strokeWidth="1" />
    <path d="M77 39V59M67 49H87" stroke="#f59e0b" strokeWidth="1" />
  </svg>
);

export const ChangeAnalysisIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Background Split */}
    <rect width="100" height="120" fill="#0f172a" />
    <rect x="100" width="100" height="120" fill="#1e1e24" />

    {/* T1 Baseline Forest Cover */}
    <circle cx="35" cy="55" r="16" fill="#15803d" fillOpacity="0.5" />
    <circle cx="55" cy="70" r="18" fill="#16a34a" fillOpacity="0.6" />
    <circle cx="45" cy="40" r="14" fill="#15803d" fillOpacity="0.5" />

    {/* T2 Changed Land / Expansion */}
    <rect x="125" y="38" width="45" height="32" rx="3" fill="#ff5225" fillOpacity="0.2" stroke="#ff5225" strokeWidth="1.2" />
    <path d="M125 70L170 70" stroke="#ff5225" strokeWidth="2" strokeDasharray="3 3" />
    <rect x="135" y="46" width="25" height="16" fill="#ff5225" fillOpacity="0.4" />

    {/* Center Split Slider Line */}
    <line x1="100" y1="0" x2="100" y2="120" stroke="#ff5225" strokeWidth="2" />
    <circle cx="100" cy="60" r="10" fill="#ff5225" />
    <path d="M97 60L103 57V63L97 60Z" fill="#ffffff" />

    {/* Time Badges */}
    <rect x="12" y="10" width="30" height="12" rx="3" fill="#2563eb" />
    <text x="17" y="19" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="monospace">T1 '21</text>

    <rect x="158" y="10" width="30" height="12" rx="3" fill="#ff5225" />
    <text x="163" y="19" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="monospace">T2 '26</text>
  </svg>
);
