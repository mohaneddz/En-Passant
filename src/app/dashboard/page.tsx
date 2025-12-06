"use client";

import { useEffect, useState } from 'react';

import { useDashboard } from '@/hooks/useDashboard';

import Header from '@/components/dashboard/Header';
import StatsGrid from '@/components/dashboard/StatsGrid';
import TabNavigation from '@/components/dashboard/TabNavigation';
import AddPlayerForm from '@/components/dashboard/AddPlayerForm';
import AddGameForm from '@/components/dashboard/AddGameForm';
import PlayersTable from '@/components/dashboard/PlayersTable';
import GamesList from '@/components/dashboard/GamesList';

import {getGames} from '@/server/games';

import SimpleDialog from '@/components/SimpleDialog';

export default function ChessDashboard() {
  const {
    activeTab,
    setActiveTab,
    players,
    showGenerateDialog,
    setShowGenerateDialog,
    showStartDialog,
    setShowStartDialog,
    showRemoveDialog,
    setShowRemoveDialog,
    hasPendingRound,
    gamesListRef,
    stats,
    handleAddPlayer,
    handleAddGame,
    handleDeletePlayer,
    handleGenerateRound,
    handleStartRound,
    handleRemoveLastRound,
    fetchPlayers,
    fetchStats,
    fetchRounds,
    handleRestorePlayer,
    handleResetAllPlayers,
    handleAbsentPlayer,
  } = useDashboard();

  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    getGames().then((g) => {
      if (mounted) setGames(g);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#111]">
      <Header />

      <main className="max-w-7xl mx-auto px-8 py-10">
        <StatsGrid stats={stats} />

        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onGenerateRound={() => setShowGenerateDialog(true)}
          onStartRound={() => setShowStartDialog(true)}
          onRemoveLastRound={() => setShowRemoveDialog(true)}
          generateDisabled={hasPendingRound}
          startDisabled={!hasPendingRound}
        />

        {/* Dialogs for round management */}
        <SimpleDialog
          isOpen={showGenerateDialog}
          onClose={() => setShowGenerateDialog(false)}
          onConfirm={handleGenerateRound}
          title="Generate New Round?"
          description="This will create pairings for the next round. You can review them before starting the round."
          confirmText="Generate"
          confirmColor="bg-[#fbbf24] hover:bg-[#fbbf24]/90"
        />

        <SimpleDialog
          isOpen={showStartDialog}
          onClose={() => setShowStartDialog(false)}
          onConfirm={handleStartRound}
          title="Start Round?"
          description="This will officially start the round and update player stats. Make sure the pairings are correct."
          confirmText="Start Round"
          confirmColor="bg-green-600 hover:bg-green-700"
        />

        <SimpleDialog
          isOpen={showRemoveDialog}
          onClose={() => setShowRemoveDialog(false)}
          onConfirm={handleRemoveLastRound}
          title="Remove Last Round?"
          description="This will delete the last round and revert all changes. This action cannot be undone."
          confirmText="Remove"
          confirmColor="bg-red-600 hover:bg-red-700"
        />

        {activeTab === 'players' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AddPlayerForm onAddPlayer={handleAddPlayer} />
            <PlayersTable
              players={players}
              onDelete={handleDeletePlayer}
              onRefresh={fetchPlayers}
              onRestore={handleRestorePlayer}
              onReset={handleResetAllPlayers}
              onAbsent={handleAbsentPlayer}
            />
          </div>
        )}

        {activeTab === 'games' && (
          <div className="space-y-4">
            <AddGameForm 
              players={players} 
              onAddGame={handleAddGame} 
            />
            <GamesList
              ref={gamesListRef}
              games={games}
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