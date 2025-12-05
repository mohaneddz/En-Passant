import { useState, useEffect } from 'react';
// import { updateGame } from '@/server/games';

export const useGamesList = (rounds: any[], onGameUpdate?: () => void) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedResults, setSelectedResults] = useState<Record<number, string>>({});

  // Initialize to the active round or the last round
  useEffect(() => {
    if (rounds && rounds.length > 0) {
      const activeIndex = rounds.findIndex(r => r.status === 'In progress' || r.status === 'active');
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

  return {
    currentIndex,
    selectedResults,
    nextRound,
    prevRound,
    handleResultSelect,
  };
};
