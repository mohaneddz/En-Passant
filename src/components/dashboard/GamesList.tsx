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
      <div className="flex items-center justify-between bg-[#071034]/70 backdrop-blur-md p-5 rounded-2xl border border-cyan-500/20 mb-8 shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevRound}
          disabled={currentIndex === 0}
          className="text-cyan-400 hover:text-white hover:bg-cyan-500/10 disabled:opacity-20 transition-all border border-cyan-500/10"
        >
          <ChevronLeft className="w-8 h-8" strokeWidth={3} />
        </Button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 text-[#00e5ff] mb-2">
            <Swords className="w-5 h-5 drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
            <span className="font-black uppercase tracking-[0.2em] text-sm italic">{currentRound.label || `Round ${currentIndex + 1}`}</span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all border ${
            currentRound.status === 'In progress' || currentRound.status === 'active'
              ? 'bg-cyan-500/20 text-[#00e5ff] border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
              : 'bg-[#050d1e]/80 text-cyan-500/40 border-cyan-500/10'
          }`}>
            {currentRound.status || 'Archived'}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextRound}
          disabled={currentIndex === rounds.length - 1}
          className="text-cyan-400 hover:text-white hover:bg-cyan-500/10 disabled:opacity-20 transition-all border border-cyan-500/10"
        >
          <ChevronRight className="w-8 h-8" strokeWidth={3} />
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
