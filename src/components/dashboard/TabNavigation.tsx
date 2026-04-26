import React from "react";
import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGenerateRound?: () => void;
  onStartRound?: () => void;
  onRemoveLastRound?: () => void;
  generateDisabled?: boolean;
  startDisabled?: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  onGenerateRound,
  onRemoveLastRound,
  generateDisabled = false,
}) => {
  const containerClass =
    "flex gap-1 bg-[#1a1a1a] p-1 rounded-xl w-fit border border-[#333]";
  const activeClass =
    "bg-[#fbbf24] text-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-400";
  const inactiveClass = "text-gray-400 hover:text-white hover:bg-[#262626]";
  const disabledClass =
    "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-inherit shadow-none";

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
          className="bg-red-700/70 text-white shadow-lg shadow-red-500/20 hover:bg-red-600/70"
        >
          Remove Last Round
        </Button>
      </div>
    </div>
  );
};

export default TabNavigation;
