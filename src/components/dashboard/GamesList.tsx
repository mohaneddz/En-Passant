import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGamesList } from '@/hooks/useGamesList';

import { deleteGameById } from '@/server/games';

import GameAdminCard from '@/components/dashboard/GameAdminCard';

interface GamesListProps {
  games: any[];
  onValidateRound?: (roundId: string, results: any[]) => void;
  onGameUpdate?: () => void;
}

export interface GamesListRef {
  triggerValidation: () => void;
}

const GamesList = forwardRef<GamesListRef, GamesListProps>(({ games, onValidateRound, onGameUpdate }, ref) => {
  const { rounds, currentIndex, selectedResults, selectedByes, nextRound, prevRound, handleResultSelect, triggerValidation } = useGamesList(games, onGameUpdate, onValidateRound);

  useImperativeHandle(ref, () => ({
    triggerValidation,
  }));


  if (!games || games.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <p className="text-gray-500">No rounds generated yet.</p>
      </div>
    );
  }

  const currentRound = rounds[currentIndex];

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
            key={game.id ?? index}
            gameNumber={game.gameNumber || index + 1}
            whitePlayer={game.white}
            blackPlayer={game.black}
            status={game.status}
            presence={game.presence}
            isEditable={currentRound.status === 'In progress'}
            selectedResult={selectedResults[index]}
            isBye={selectedByes[index]}
            onSelectResult={(result, isBye) => handleResultSelect(index, result, isBye, game)}
            onDelete={async () => {
              await deleteGameById(game.id);
              if (onGameUpdate) onGameUpdate();
            }}
          />
        ))}
      </div>
    </div>
  );
});

GamesList.displayName = 'GamesList';
export default GamesList;
