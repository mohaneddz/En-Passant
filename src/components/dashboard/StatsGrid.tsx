import React from 'react';
import { Users, Grid3x3, Trophy, Calendar } from 'lucide-react';

interface Stats {
  totalPlayers: number | null;
  totalRounds: number | null;
  gamesPlayed: number | null;
  currentRound: number | null;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value }) => (
  <div 
    className="relative bg-[#1a1a1a] transition-colors group overflow-hidden"
    style={{
      width: '100%', // Responsive width, but min/max can be controlled by grid
      minWidth: '165px',
      height: '98px',
      borderRadius: '8px',
      border: '1px solid #38393E',
      fontFamily: '"Lexend Deca", sans-serif'
    }}
  >
    {/* Icon - Top Right */}
    <div className="absolute top-[12px] right-[15px] text-[#fbbf24]">
      <Icon size={20} />
    </div>

    {/* Content - Bottom Left */}
    <div className="absolute bottom-[12px] left-[15px]">
      
      <p 
        className="text-gray-400 text-xs font-medium mb-[8px] leading-none"
        style={{
          fontSize: '12px',
          lineHeight: '100%'
        }}
      >
        {label}
      </p>
      <p 
        className="text-white font-bold leading-none tracking-normal"
        style={{
          fontSize: '24px', // Adjusted for visual balance in 98px height
          lineHeight: '100%'
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

interface StatsGridProps {
  stats: Stats;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => (
  <>
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@100..900&display=swap');
    `}</style>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <StatCard 
        icon={Users} 
        label="Total Players" 
        value={stats.totalPlayers ?? 0}
      />
      <StatCard 
        icon={Grid3x3} 
        label="Total rounds" 
        value={stats.totalRounds ?? 0}
      />
      <StatCard 
        icon={Trophy} 
        label="Games played" 
        value={stats.gamesPlayed ?? 0}
      />
      <StatCard 
        icon={Calendar} 
        label="Current round" 
        value={stats.currentRound ?? '-'}
      />
    </div>
  </>
);

export default StatsGrid;
