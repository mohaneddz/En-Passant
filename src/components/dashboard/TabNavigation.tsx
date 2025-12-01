import React from 'react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => (
  <div className="flex gap-1 mb-8 bg-[#1a1a1a] p-1 rounded-xl w-fit border border-[#333]">
    <button
      onClick={() => setActiveTab('players')}
      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
        activeTab === 'players'
          ? 'bg-[#fbbf24] text-black shadow-lg shadow-yellow-500/20'
          : 'text-gray-400 hover:text-white hover:bg-[#262626]'
      }`}
    >
      Players
    </button>
    <button
      onClick={() => setActiveTab('games')}
      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
        activeTab === 'games'
          ? 'bg-[#fbbf24] text-black shadow-lg shadow-yellow-500/20'
          : 'text-gray-400 hover:text-white hover:bg-[#262626]'
      }`}
    >
      Games & Rounds
    </button>
  </div>
);

export default TabNavigation;
