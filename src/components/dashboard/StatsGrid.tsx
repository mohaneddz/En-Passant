import React from 'react';
import { Users, Grid3x3, Trophy, Calendar } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value }) => (
  <div 
    className="relative bg-[#1a1a1a] transition-colors group overflow-hidden w-full min-w-[165px] h-[98px] rounded-lg border border-[#38393E] font-['Lexend_Deca',sans-serif]"
  >
    <div className="absolute top-3 right-[15px] text-[#fbbf24]">
      <Icon size={20} />
    </div>
    <div className="absolute bottom-3 left-[15px]">
      <p className="text-gray-400 text-xs font-medium mb-2 leading-none">
        {label}
      </p>
      <p className="text-white font-bold leading-none tracking-normal text-2xl">
        {value}
      </p>
    </div>
  </div>
);

interface StatsGridProps {
  stats: {
    totalPlayers: number | null;
    totalRounds: number | null;
    gamesPlayed: number | null;
    currentRound: number | null;
  };
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => (
  <>
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
