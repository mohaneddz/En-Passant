import { useState, useEffect, useMemo } from 'react';
import { getCurrentRound } from '@/server/games';
import { updateGameResult } from '@/server/results';

export const useGamesList = (games: any[], onGameUpdate?: () => void, onValidateRound?: (roundId: string, results: any[]) => void) => {
  
  // Process games into rounds (copied from page.tsx)
  const rounds = useMemo(() => {
    const roundsMap = new Map();
    games.forEach((game) => {
      const roundId = String(game.round);
      if (!roundsMap.has(roundId)) {
        roundsMap.set(roundId, {
          id: roundId,
          label: `Round ${roundId}`,
          status: 'Finished',
          games: []
        });
      }
      const round = roundsMap.get(roundId);
      round.games.push(game);

    });

    const sortedRounds = Array.from(roundsMap.values()).sort((a: any, b: any) => Number(a.id) - Number(b.id));
    
    // Set the last round's status to 'In progress'
    if (sortedRounds.length > 0) {
      sortedRounds[sortedRounds.length - 1].status = 'In progress';
    }

    return sortedRounds;
  }, [games]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedResults, setSelectedResults] = useState<Record<number, string>>({});
  const [selectedByes, setSelectedByes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const initIndex = async () => {
      const round = await getCurrentRound();
      setCurrentIndex(Math.max(0, round - 1));
    };
    initIndex();
  }, []);

  useEffect(() => {
    const initialResults: Record<number, string> = {};
    const initialByes: Record<number, boolean> = {};
    
    if (rounds[currentIndex]?.games) {
      rounds[currentIndex].games.forEach((game: any, index: number) => {
        const s = game.status?.toUpperCase();
        
        // presence=1 => one player absent/solo BYE. presence=0 means both absent.
        if (game.presence === 1) {
          initialByes[index] = true;
        }
        
        // Set the result
        if (s === 'WHITE_WINS' || s === '1-0') initialResults[index] = '1-0';
        else if (s === 'BLACK_WINS' || s === '0-1') initialResults[index] = '0-1';
        else if (s === 'DRAW' || s === '1/2-1/2') initialResults[index] = '0.5-0.5';
      });
    }
    setSelectedResults(initialResults);
    setSelectedByes(initialByes);
  }, [currentIndex, rounds]);

  const nextRound = () => {
    if (currentIndex < rounds.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevRound = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleResultSelect = async (gameIndex: number, result: string, isBye: boolean, game: any) => {
    const hasOpponent = Number.isInteger(game?.black) && game.black > 0;
    const forcedBye = !hasOpponent;
    const effectiveIsBye = forcedBye ? true : isBye;

    setSelectedResults(prev => {
      const next = { ...prev };
      const nextResult = forcedBye ? '1-0' : result;
      if (nextResult) {
        next[gameIndex] = nextResult;
      } else {
        delete next[gameIndex];
      }
      return next;
    });
    setSelectedByes(prev => ({ ...prev, [gameIndex]: effectiveIsBye }));

    if (!game) {
      console.error("Game data is missing");
      return;
    }
    
    // Map UI result to DB result format
    let dbResult: "WHITE_WINS" | "BLACK_WINS" | "DRAW" | "PENDING" = "PENDING";
    const effectiveResult = forcedBye ? "1-0" : result;

    if (effectiveResult === '1-0') {
      dbResult = 'WHITE_WINS';
    } else if (effectiveResult === '0-1') {
      dbResult = 'BLACK_WINS';
    } else if (effectiveResult === '0.5-0.5') {
      dbResult = 'DRAW';
    }

    // Admin result buttons should always persist as a normal played match
    // unless this is a true no-opponent/forced-bye row.
    const presence = forcedBye || effectiveIsBye ? 1 : 2;

    try {
      await updateGameResult(
        game.id,
        dbResult,
        effectiveIsBye,
        game.white,
        game.black,
        presence
      );
      
      if (onGameUpdate) {
        onGameUpdate();
      }
    } catch (error) {
      console.error("Failed to update game result:", error);
    }
  };

  const triggerValidation = () => {
    if (onValidateRound && rounds[currentIndex]) {
      const results = Object.entries(selectedResults).map(([index, result]) => ({
        gameIndex: parseInt(index),
        result
      }));
      onValidateRound(rounds[currentIndex].id, results);
    }
  };

  return {
    rounds,
    currentIndex,
    selectedResults,
    selectedByes,
    nextRound,
    prevRound,
    handleResultSelect,
    triggerValidation,
  };
};
