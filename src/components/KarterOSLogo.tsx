import React from "react";

interface KarterOSLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
}

export default function KarterOSLogo({
  className = "",
  size = 40,
  showText = false,
  textColor = "text-white",
}: KarterOSLogoProps) {
  const pixelSize = typeof size === "number" ? `${size}px` : size;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SVG Vector Logo */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Metallic Silver Gradient */}
          <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="30%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Alert Red Gradient */}
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="60%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>

          {/* Dark Shield fill gradient */}
          <linearGradient id="darkFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* 1. Shield Background Group */}
        {/* Outer Shield Border */}
        <path
          d="M256 32 L448 104 L448 240 C448 384 256 480 256 480 C256 480 64 384 64 240 L64 104 Z"
          fill="url(#darkFillGrad)"
          stroke="url(#silverGrad)"
          strokeWidth="10"
          strokeLinejoin="round"
        />

        {/* Inner Shield Accent Line */}
        <path
          d="M256 56 L418 117 L418 240 C418 360 256 444 256 444 C256 444 94 360 94 240 L94 117 Z"
          stroke="url(#silverGrad)"
          strokeWidth="3"
          strokeOpacity="0.5"
          fill="none"
        />

        {/* 2. Speedometer Arc */}
        {/* Background Arc */}
        <path
          d="M140 210 A 118 118 0 0 1 372 210"
          stroke="#334155"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Active Arc segment */}
        <path
          d="M140 210 A 118 118 0 0 1 334 140"
          stroke="url(#redGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Tick marks on Speedometer */}
        <line x1="256" y1="84" x2="256" y2="94" stroke="url(#silverGrad)" strokeWidth="4" />
        <line x1="170" y1="130" x2="178" y2="136" stroke="url(#silverGrad)" strokeWidth="4" />
        <line x1="342" y1="130" x2="334" y2="136" stroke="url(#silverGrad)" strokeWidth="4" />
        {/* Speedometer needle */}
        <line
          x1="256"
          y1="210"
          x2="320"
          y2="140"
          stroke="url(#redGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="256" cy="210" r="10" fill="url(#silverGrad)" />

        {/* 3. Sleek Car Silhouette crossing center */}
        <path
          d="M100 240 C140 210, 180 200, 230 195 C280 190, 320 195, 360 210 C410 220, 430 225, 450 235 L448 240 C410 242, 380 240, 340 241 C280 243, 220 248, 160 252 C130 254, 110 248, 100 240 Z"
          fill="url(#silverGrad)"
        />
        <path
          d="M86 248 L130 242 Q230 230 360 225 Q410 225 456 222 L454 227 Q410 231 360 231 Q230 236 130 248 Z"
          fill="#020617"
        />

        {/* 4. Silver Wrench below car */}
        <g transform="translate(130, 265) scale(0.95)">
          {/* Shaft of wrench */}
          <path
            d="M30 15 L140 15"
            stroke="url(#silverGrad)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Left Head of wrench */}
          <circle cx="25" cy="15" r="21" fill="url(#silverGrad)" />
          {/* Mouth cut of left head */}
          <path
            d="M5 15 L28 4 L28 26 Z"
            fill="#020617"
            stroke="url(#silverGrad)"
            strokeWidth="2"
          />
          {/* Right end accent block */}
          <rect x="135" y="5" width="16" height="20" rx="3" fill="url(#silverGrad)" />
        </g>

        {/* 5. Three vertical bar charts with red checkmark slash */}
        {/* Bar 1 */}
        <rect x="230" y="325" width="22" height="40" rx="4" fill="url(#silverGrad)" />
        {/* Bar 2 */}
        <rect x="260" y="305" width="22" height="60" rx="4" fill="url(#silverGrad)" />
        {/* Bar 3 */}
        <rect x="290" y="285" width="22" height="80" rx="4" fill="url(#silverGrad)" />

        {/* Vibrant Red Checkmark slash across bar charts */}
        <path
          d="M210 320 L255 355 L350 245"
          stroke="url(#redGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.5))" }}
        />
      </svg>

      {/* Styled Brand Name Text */}
      {showText && (
        <span className={`font-extrabold font-sans tracking-tight ${textColor} select-none flex items-center`}>
          <span className="text-white hover:text-slate-200 transition-colors">Karter</span>
          <span className="text-rose-500 hover:text-red-400 transition-colors">OS</span>
          <span className="text-xxs font-bold uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded ml-1.5 tracking-wider">
            SaaS
          </span>
        </span>
      )}
    </div>
  );
}
