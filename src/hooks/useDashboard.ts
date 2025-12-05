import { useState, useEffect, useRef } from 'react';
import { getPlayers, addPlayer, deletePlayer, getStats, getGames } from '@/lib/api';
import { getRounds } from '@/server/rounds';
import { generateNextRound, undoLastRound } from '@/server/actions';
import { GamesListRef } from '@/components/dashboard/GamesList';

interface Player {
  id: string;
  name: string;
  points: number;
  buchholz: number;
  wins: number;
  losses: number;
  draws: number;
}

interface Game {
  id: string;
  white_player?: { name?: string | null } | null;
  black_player?: { name?: string | null } | null;
  result?: string | null;
}

export const useDashboard = () => {
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNextPhaseDialog, setShowNextPhaseDialog] = useState(false);
  const [showUndoDialog, setShowUndoDialog] = useState(false);
  const gamesListRef = useRef<GamesListRef>(null);

  const [stats, setStats] = useState<{
    totalPlayers: number | null;
    totalRounds: number | null;
    gamesPlayed: number | null;
    currentRound: number | null;
  }>({
    totalPlayers: null,
    totalRounds: null,
    gamesPlayed: null,
    currentRound: null,
  });

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats({
        ...data,
        currentRound: data.currentRound,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRounds = async () => {
    try {
      const roundsData = await getRounds();
      const roundsWithGames = await Promise.all(
        roundsData.map(async (round: any) => {
          const games = await getGames(round.id) as Game[];
          return {
            ...round,
            games: games.map((g: Game, index: number) => ({
              id: g.id,
              gameNumber: index + 1,
              whitePlayer: g.white_player?.name || 'Unknown',
              blackPlayer: g.black_player?.name || 'Unknown',
              result: g.result,
              status: g.result ? g.result.replace('_', ' ') : 'scheduled',
            })),
          };
        })
      );
      setRounds(roundsWithGames);
    } catch (error) {
      console.error('Error fetching rounds:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const data = await getPlayers();
      setPlayers(data as unknown as Player[]);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    fetchStats();
    fetchRounds();
  }, []);

  const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;
  const isNextPhaseDisabled = false;

  const handleAddPlayer = async (newPlayer: { name: string }) => {
    try {
      await addPlayer(newPlayer.name);
      await fetchPlayers();
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    try {
      await deletePlayer(id);
      await fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const handleNextPhase = async () => {
    try {
      setLoading(true);
      const result = await generateNextRound();
      if (result.success) {
        await fetchStats();
        await fetchRounds();
        await fetchPlayers();
        setShowNextPhaseDialog(false);
      } else {
        console.error('Error starting next phase:', result.error);
      }
    } catch (error) {
      console.error('Error starting next phase:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUndoPhase = async () => {
    try {
      setLoading(true);
      const result = await undoLastRound();
      if (result.success) {
        await fetchStats();
        await fetchRounds();
        await fetchPlayers();
        setShowUndoDialog(false);
      } else {
        console.error('Error undoing phase:', result.error);
      }
    } catch (error) {
      console.error('Error undoing phase:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    players,
    rounds,
    loading,
    showNextPhaseDialog,
    setShowNextPhaseDialog,
    showUndoDialog,
    setShowUndoDialog,
    gamesListRef,
    stats,
    lastRound,
    isNextPhaseDisabled,
    handleAddPlayer,
    handleDeletePlayer,
    handleNextPhase,
    handleUndoPhase,
    fetchPlayers,
    fetchStats,
    fetchRounds,
  };
};
