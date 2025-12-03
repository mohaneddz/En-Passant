import React from 'react';
import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onValidate?: () => void;
  onNextPhase?: () => void;
  onUndo?: () => void;
  validateDisabled?: boolean;
  nextPhaseDisabled?: boolean;
  isRoundValidated?: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  onValidate, 
  onNextPhase,
  onUndo,
  validateDisabled = false,
  nextPhaseDisabled = false,
  isRoundValidated = false
}) => {
  const containerClass = "flex gap-1 bg-[#1a1a1a] p-1 rounded-xl w-fit border border-[#333]";
  const activeClass = "bg-[#fbbf24] text-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-400";
  const inactiveClass = "text-gray-400 hover:text-white hover:bg-[#262626]";
  const disabledClass = "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-inherit shadow-none";

  return (
    <div className="flex justify-between items-center mb-8">
      <div className={containerClass}>
        <Button
          onClick={() => setActiveTab('players')}
          className={`px-6 ${activeTab === 'players' ? activeClass : inactiveClass}`}
          variant="ghost"
        >
          Players
        </Button>
        <Button
          onClick={() => setActiveTab('games')}
          className={`px-6 ${activeTab === 'games' ? activeClass : inactiveClass}`}
          variant="ghost"
        >
          Games & Rounds
        </Button>
      </div>
      <div className={containerClass}>
        <Button 
          onClick={onValidate}
          variant="ghost"
          className={isRoundValidated 
            ? "bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40 shadow-none" 
            : "bg-[#fbbf24] text-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-400"
          }
        >
          {isRoundValidated ? "Unvalidate Round" : "Validate Round"}
        </Button>
        <Button 
          onClick={onNextPhase}
          disabled={nextPhaseDisabled}
          className={`${activeClass} ${nextPhaseDisabled ? disabledClass + " bg-gray-800 text-gray-500" : ""}`}
        >
          Start The Next Phase
        </Button>
        <Button 
          onClick={onUndo} 
          className="bg-gray-700/70 text-white shadow-lg shadow-gray-500/20 hover:bg-gray-600/70"
        >
          Undo To Last Phase
        </Button>
      </div>
    </div>
  );
};

export default TabNavigation;
