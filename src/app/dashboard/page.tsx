"use client";

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/dashboard/Header';
import StatsGrid from '@/components/dashboard/StatsGrid';
import TabNavigation from '@/components/dashboard/TabNavigation';
import AddPlayerForm from '@/components/dashboard/AddPlayerForm';
import PlayersTable from '@/components/dashboard/PlayersTable';
import GamesList, { GamesListRef } from '@/components/dashboard/GamesList';

import { getPlayers, addPlayer, deletePlayer, LeaderboardView, getStats } from '@/lib/api';
import { getRounds } from '@/server/rounds';

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
  const [isRoundValidated, setIsRoundValidated] = useState(false);

  // Dialog states
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [showNextPhaseDialog, setShowNextPhaseDialog] = useState(false);
  const [showUndoDialog, setShowUndoDialog] = useState(false);

  const gamesListRef = useRef<GamesListRef>(null);

  const [stats, setStats] = useState<{ totalPlayers: number | null, totalRounds: number | null, gamesPlayed: number | null, currentRound: number | null }>({
    totalPlayers: null,
    totalRounds: null,
    gamesPlayed: null,
    currentRound: null,
  })

  async function validateRound(){
    setIsRoundValidated(true);
  }
  
  async function unvalidateRound(){
    setIsRoundValidated(false);
  }

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
      const data = await getRounds();
      setRounds(data);
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

  useEffect(() => {
    if (rounds.length > 0) {
      const last = rounds[rounds.length - 1];
      setIsRoundValidated(last.status !== 'In progress');
    } else {
      setIsRoundValidated(false);
    }
  }, [rounds]);

  // Determine round status for button states
  const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;

  const isNextPhaseDisabled = rounds.length > 0 && !isRoundValidated;

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

  const handleValidateRound = async (roundId: string, results: any[]) => {
    try {
      // await validateRound(roundId, results);
      await validateRound();
      // await fetchStats();
      // await fetchRounds();
      setShowValidateDialog(false);
    } catch (error) {
      console.error('Error validating round:', error);
    }
  };

  const handleUnvalidateRound = async () => {
    try {
      console.log("Unvalidating round...");
      if (lastRound) {
        // await unvalidateRound(lastRound.id);
        await unvalidateRound();
        // no logic so far, we keep it simple
        // await fetchStats();
        // await fetchRounds();
        setShowValidateDialog(false);
      }
    } catch (error) {
      console.error('Error unvalidating round:', error);
    }
  };

  const handleNextPhase = async () => {
    try {
      // no logic so far, we keep it simple
      // await generatePairings();
      // await fetchStats();
      // await fetchRounds();
    } catch (error) {
      console.error('Error starting next phase:', error);
    }
  };

  const handleUndoPhase = async () => {
    try {
      // await undoLastPhase();
      // await fetchStats();
      // await fetchRounds();
      console.log("Undo triggered");
    } catch (error) {
      console.error('Error undoing phase:', error);
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
          onValidate={() => setShowValidateDialog(true)}
          onNextPhase={() => setShowNextPhaseDialog(true)}
          onUndo={() => setShowUndoDialog(true)}
          nextPhaseDisabled={isNextPhaseDisabled}
          isRoundValidated={isRoundValidated}
        />

        {/* Dialogs moved here to be accessible from any tab */}
        <SimpleDialog
          isOpen={showValidateDialog}
          onClose={() => setShowValidateDialog(false)}
          onConfirm={() => {
            if (isRoundValidated) {
              unvalidateRound();
            } else {
              validateRound();
              gamesListRef.current?.triggerValidation();
            }
          }}
          title={isRoundValidated ? "Unvalidate Round?" : "Validate Round?"}
          description={isRoundValidated 
            ? "This will unlock the round for editing. Rankings might change." 
            : "This will lock the current results and update player scores."
          }
          confirmText={isRoundValidated ? "Unvalidate" : "Validate"}
          confirmColor={isRoundValidated ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
        />

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
              onValidateRound={handleValidateRound}
            />
          </div>
        )}
      </main>
    </div>
  );
}