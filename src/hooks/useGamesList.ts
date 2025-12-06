import { useState, useEffect, useMemo } from 'react';
import {getCurrentRound} from '@/server/games';
// import { updateGame } from '@/server/games';

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

      if (!game.result) {
        round.status = 'In progress';
      }
    });

    return Array.from(roundsMap.values()).sort((a: any, b: any) => Number(a.id) - Number(b.id));
  }, [games]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedResults, setSelectedResults] = useState<Record<number, string>>({});

  useEffect(() => {
    const initIndex = async () => {
      const round = await getCurrentRound();
      setCurrentIndex(Math.max(0, round - 1));
    };
    initIndex();
  }, []);

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

  const nextRound = () => {
    if (currentIndex < rounds.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevRound = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleResultSelect = async (gameIndex: number, result: string) => {
    setSelectedResults(prev => ({ ...prev, [gameIndex]: result }));

    const currentRound = rounds[currentIndex];
    if (currentRound && currentRound.games && currentRound.games[gameIndex]) {
      const game = currentRound.games[gameIndex];
      // Map UI result to DB result format
      let dbResult: "white_wins" | "black_wins" | "draw" | "bye" | "scheduled" = "scheduled";

      if (result === '1-0') dbResult = 'white_wins';
      else if (result === '0-1') dbResult = 'black_wins';
      else if (result === '0.5-0.5') dbResult = 'draw';
      else if (result === 'bye') dbResult = 'bye';

      try {
        // await updateGameResult(game.id, dbResult);
        if (onGameUpdate) {
          onGameUpdate();
        }
      } catch (error) {
        console.error("Failed to update game result:", error);
      }
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
    nextRound,
    prevRound,
    handleResultSelect,
    triggerValidation,
  };
};
