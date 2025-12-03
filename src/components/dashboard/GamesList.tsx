import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GameAdminCard from '@/components/dashboard/GameAdminCard';

interface GamesListProps {
  rounds: any[];
  onValidateRound?: (roundId: string, results: any[]) => void;
}

export interface GamesListRef {
  triggerValidation: () => void;
}

const GamesList = forwardRef<GamesListRef, GamesListProps>(({ rounds, onValidateRound }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedResults, setSelectedResults] = useState<Record<number, string>>({});

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

  // Initialize to the active round or the last round
  useEffect(() => {
    if (rounds && rounds.length > 0) {
      const activeIndex = rounds.findIndex(r => r.status === 'In progress');
      if (activeIndex !== -1) {
        setCurrentIndex(activeIndex);
      } else {
        setCurrentIndex(rounds.length - 1);
      }
    }
  }, [rounds]);

  // Reset selections when round changes and pre-fill existing results
  useEffect(() => {
    const initialResults: Record<number, string> = {};
    if (rounds[currentIndex]?.games) {
        rounds[currentIndex].games.forEach((game: any, index: number) => {
            const s = game.status?.toLowerCase();
            if (s === 'white wins' || s === '1-0') initialResults[index] = '1-0';
            else if (s === 'black wins' || s === '0-1') initialResults[index] = '0-1';
            else if (s === 'draw' || s === '1/2-1/2') initialResults[index] = '0.5-0.5';
            else if (s === 'bye') initialResults[index] = 'bye';
        });
    }
    setSelectedResults(initialResults);
  }, [currentIndex, rounds]);

  if (!rounds || rounds.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <p className="text-gray-500">No rounds generated yet.</p>
      </div>
    );
  }

  const currentRound = rounds[currentIndex];

  // Fix for undefined currentRound
  if (!currentRound) {
    return (
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-12 text-center">
        <p className="text-red-500">Error loading round data.</p>
      </div>
    );
  }

  const nextRound = () => {
    if (currentIndex < rounds.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevRound = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleResultSelect = (gameIndex: number, result: string) => {
    setSelectedResults(prev => ({ ...prev, [gameIndex]: result }));
  };

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
            currentRound.status === 'In progress' 
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
            gameNumber={game.gameNumber}
            whitePlayer={game.whitePlayer}
            blackPlayer={game.blackPlayer}
            status={game.status}
            isEditable={currentRound.status === 'In progress'}
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
