export const MedalIcon = ({ rank }: { rank: number }) => {
  const colors = {
    1: { fill: "#fbbf24", stroke: "#d97706" }, // Gold
    2: { fill: "#94a3b8", stroke: "#475569" }, // Silver
    3: { fill: "#b45309", stroke: "#78350f" }, // Bronze
  };
  
  const color = colors[rank as keyof typeof colors];

  return (
    <div className="relative flex items-center justify-center w-8 h-8">
       {/* Simple Medal SVG representation */}
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color.fill} stroke={color.stroke} strokeWidth="1" className="w-8 h-8 drop-shadow-md">
         <circle cx="12" cy="12" r="9" />
         <path d="M10 8h4l-2 8z" fill="rgba(255,255,255,0.3)" stroke="none"/>
       </svg>
       <span className="absolute text-[10px] font-bold text-white drop-shadow-sm -mt-0.5">{rank}</span>
       {/* Ribbon hint */}
       <div className="absolute -top-2 text-blue-500">
         <svg width="16" height="8" viewBox="0 0 16 8" fill="currentColor">
            <path d="M0 0L8 8L16 0H0Z" />
         </svg>
       </div>
    </div>
  );
};
