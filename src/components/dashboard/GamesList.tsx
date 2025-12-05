import { forwardRef, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GameAdminCard from '@/components/dashboard/GameAdminCard';
import { useGamesList } from '@/hooks/useGamesList';

interface GamesListProps {
  rounds: any[];
  onValidateRound?: (roundId: string, results: any[]) => void;
  onGameUpdate?: () => void;
}

export interface GamesListRef {
  triggerValidation: () => void;
}

const GamesList = forwardRef<GamesListRef, GamesListProps>(({ rounds, onValidateRound, onGameUpdate }, ref) => {
  const { currentIndex, selectedResults, nextRound, prevRound, handleResultSelect } = useGamesList(rounds, onGameUpdate);

  useImperativeHandle(ref, () => ({
    triggerValidation: () => {
      if (onValidateRound && currentRound) {
        const results = Object.entries(selectedResults).map(([index, result]) => ({
          gameIndex: parseInt(index),
          result
        }));
        onValidateRound(currentRound.id, results);
      }
    }
  }));

  if (!rounds || rounds.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <p className="text-gray-500">No rounds generated yet.</p>
      </div>
    );
  }

  const currentRound = rounds[currentIndex];
  console.log("Current Round:", currentRound);

  // Fix for undefined currentRound
  if (!currentRound) {
    return (
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-12 text-center">
        <p className="text-red-500">Error loading round data.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-xl border border-[#333] mb-6 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevRound}
          disabled={currentIndex === 0}
          className="text-gray-400 hover:text-white hover:bg-[#262626] disabled:opacity-30"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-[#FCD34D] mb-1">
            <Swords className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider text-sm">{currentRound.label || `Round ${currentIndex + 1}`}</span>
          </div>
          <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-semibold ${
            currentRound.status === 'In progress' || currentRound.status === 'active'
              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
              : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}>
            {currentRound.status || 'Unknown'}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextRound}
          disabled={currentIndex === rounds.length - 1}
          className="text-gray-400 hover:text-white hover:bg-[#262626] disabled:opacity-30"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      <div className="space-y-3">
        {currentRound.games?.map((game: any, index: number) => (
          <GameAdminCard
            key={index}
            gameNumber={game.gameNumber || index + 1}
            whitePlayer={game.whitePlayer}
            blackPlayer={game.blackPlayer}
            status={game.status}
            isEditable={currentRound.is_current || currentRound.status === 'pending' || currentRound.status === 'active'}
            selectedResult={selectedResults[index]}
            onSelectResult={(result) => handleResultSelect(index, result)}
          />
        ))}
      </div>
    </div>
  );
});

GamesList.displayName = 'GamesList';
export default GamesList;
