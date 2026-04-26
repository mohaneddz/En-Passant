import React from 'react';
import { Users, Grid3x3, Trophy, Calendar } from 'lucide-react';
import type { StatsGridProps } from '@/server/stats';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value }) => (
  <div 
    className="relative bg-[#071034]/60 backdrop-blur-xl transition-all duration-300 group overflow-hidden w-full min-w-[165px] h-[98px] rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 font-sans shadow-lg shadow-black/20"
  >
    <div className="absolute top-3 right-[15px] text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
      <Icon size={20} />
    </div>
    <div className="absolute bottom-3 left-[15px]">
      <p className="text-cyan-500/50 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">
        {label}
      </p>
      <p className="text-white font-black leading-none tracking-tighter text-2xl">
        {value}
      </p>
    </div>
  </div>
);

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
        label="Total Games" 
        value={stats.totalGames ?? 0}
      />
    </div>
  </>
);

export default StatsGrid;
