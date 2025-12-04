"use client";

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/dashboard/Header';
import StatsGrid from '@/components/dashboard/StatsGrid';
import TabNavigation from '@/components/dashboard/TabNavigation';
import AddPlayerForm from '@/components/dashboard/AddPlayerForm';
import PlayersTable from '@/components/dashboard/PlayersTable';
import GamesList, { GamesListRef } from '@/components/dashboard/GamesList';

import { getPlayers, addPlayer, deletePlayer, getStats, createRound, deleteLastRound, updateRoundStatus, getRounds, getGames } from '@/lib/api';

import SimpleDialog from '@/components/SimpleDialog';

interface Player {
  id: string;
  name: string;
  points: number;
  buchholz: number;
  wins: number;
  losses: number;
  draws: number;
}

export default function ChessDashboard() {

  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showNextPhaseDialog, setShowNextPhaseDialog] = useState(false);
  const [showUndoDialog, setShowUndoDialog] = useState(false);

  const gamesListRef = useRef<GamesListRef>(null);

  const [stats, setStats] = useState<{ totalPlayers: number | null, totalRounds: number | null, gamesPlayed: number | null, currentRound: number | null }>({
    totalPlayers: null,
    totalRounds: null,
    gamesPlayed: null,
    currentRound: null,
  })

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats({
        ...data,
        currentRound: data.currentRound ?? null
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  const fetchRounds = async () => {
    try {
      const roundsData = await getRounds();
      
      // Fetch games for each round to populate the UI
      const roundsWithGames = await Promise.all(roundsData.map(async (round) => {
        const games = await getGames(round.id);
        return {
          ...round,
          games: games.map((g, index) => ({
            id: g.id,
            gameNumber: index + 1,
            whitePlayer: g.white_player?.name || 'Unknown',
            blackPlayer: g.black_player?.name || 'Unknown',
            result: g.result,
            status: g.result ? g.result.replace('_', ' ') : 'scheduled'
          }))
        };
      }));

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

  // Determine round status for button states
  const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;

  const isNextPhaseDisabled = false;

  const handleAddPlayer = async (newPlayer: { name: string }) => {
    try {
      await addPlayer(newPlayer.name);
      await fetchPlayers(); // Refresh list
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    try {
      await deletePlayer(id);
      await fetchPlayers(); // Refresh list
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const handleNextPhase = async () => {
    try {
      setLoading(true);

      // 0. Mark current round as completed if it exists
      if (rounds.length > 0) {
        const currentActiveRound = rounds.find(r => r.status === 'In progress');
        if (currentActiveRound) {
          await updateRoundStatus(currentActiveRound.id, 'Completed');
        }
      }

      // 1. Calculate next round number
      const nextRoundNum = (stats.totalRounds || 0) + 1;
      
      // 2. Create the round in DB
      const newRound = await createRound(nextRoundNum);
      
      if (!newRound) {
        throw new Error("Failed to create round");
      }

      // 3. Call the pairing API
      const response = await fetch('/generate-pairing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          roundNumber: nextRoundNum, 
          roundId: newRound.id 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate pairings");
      }

      // 4. Refresh data
      await fetchStats();
      await fetchRounds();
      setActiveTab('games'); // Switch to games tab to see new pairings
    } catch (error) {
      console.error('Error starting next phase:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUndoPhase = async () => {
    try {
      setLoading(true);
      await deleteLastRound();
      await fetchStats();
      await fetchRounds();
      console.log("Undo triggered");
    } catch (error) {
      console.error('Error undoing phase:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111]">
      <Header />

      <main className="max-w-7xl mx-auto px-8 py-10">
        <StatsGrid stats={stats} />

        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNextPhase={() => setShowNextPhaseDialog(true)}
          onUndo={() => setShowUndoDialog(true)}
          nextPhaseDisabled={isNextPhaseDisabled}
        />

        {/* Dialogs moved here to be accessible from any tab */}
        <SimpleDialog
          isOpen={showNextPhaseDialog}
          onClose={() => setShowNextPhaseDialog(false)}
          onConfirm={handleNextPhase}
          title="Start Next Phase?"
          description="This will generate pairings for the next round based on current standings."
          confirmText="Start"
          confirmColor="bg-[#fbbf24] hover:bg-[#fbbf24]/90"
        />

        <SimpleDialog
          isOpen={showUndoDialog}
          onClose={() => setShowUndoDialog(false)}
          onConfirm={handleUndoPhase}
          title="Undo Last Phase?"
          description="This will revert the tournament to the previous state. Are you sure?"
          confirmText="Undo"
          confirmColor="bg-red-600 hover:bg-red-700"
        />

        {activeTab === 'players' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AddPlayerForm onAddPlayer={handleAddPlayer} />
            <PlayersTable
              players={players}
              onDelete={handleDeletePlayer}
            />
          </div>
        )}

        {activeTab === 'games' && (
          <div className="space-y-4">
            <GamesList
              ref={gamesListRef}
              rounds={rounds}
              onGameUpdate={() => {
                fetchStats();
                fetchRounds();
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}