import React from "react";
import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGenerateRound?: () => void;
  onStartRound?: () => void;
  onRemoveLastRound?: () => void;
  removeRoundLabel?: string;
  generateDisabled?: boolean;
  startDisabled?: boolean;
  removeDisabled?: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  onGenerateRound,
  onRemoveLastRound,
  removeRoundLabel = "Remove Last Round",
  generateDisabled = false,
  removeDisabled = false,
}) => {
  const containerClass =
    "flex gap-1 bg-[#071034]/70 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-cyan-500/20 shadow-lg";
  const activeClass =
    "bg-[#00e5ff] text-[#050d1e] font-black tracking-widest uppercase shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:bg-cyan-400 hover:scale-[1.02] transition-all duration-300";
  const inactiveClass = "text-cyan-500/60 font-bold tracking-widest uppercase hover:text-white hover:bg-cyan-500/10";
  const disabledClass =
    "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-inherit shadow-none";

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-0 justify-between items-center mb-8">
      <div className={containerClass}>
        <Button
          onClick={() => setActiveTab("players")}
          className={`px-6 ${activeTab === "players" ? activeClass : inactiveClass}`}
          variant="ghost"
        >
          Users
        </Button>
        <Button
          onClick={() => setActiveTab("games")}
          className={`px-6 ${activeTab === "games" ? activeClass : inactiveClass}`}
          variant="ghost"
        >
          Matches & Rounds
        </Button>
      </div>
      <div className={containerClass}>
        <Button
          onClick={onGenerateRound}
          disabled={generateDisabled}
          className={`${activeClass} ${
            generateDisabled ? `${disabledClass} bg-gray-800 text-gray-500` : ""
          }`}
        >
          Start Next Round
        </Button>
        <Button
          onClick={onRemoveLastRound}
          disabled={removeDisabled}
          className={`bg-red-700/70 text-white shadow-lg shadow-red-500/20 hover:bg-red-600/70 ${
            removeDisabled ? `${disabledClass} bg-gray-800 text-gray-500` : ""
          }`}
        >
          {removeRoundLabel}
        </Button>
      </div>
    </div>
  );
};

export default TabNavigation;
