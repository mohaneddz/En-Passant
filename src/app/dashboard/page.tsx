"use client";

import { useDashboard } from '@/hooks/useDashboard';

import Header from '@/components/dashboard/Header';
import StatsGrid from '@/components/dashboard/StatsGrid';
import TabNavigation from '@/components/dashboard/TabNavigation';
import AddPlayerForm from '@/components/dashboard/AddPlayerForm';
import PlayersTable from '@/components/dashboard/PlayersTable';
import GamesList, { GamesListRef } from '@/components/dashboard/GamesList';

import SimpleDialog from '@/components/SimpleDialog';

export default function ChessDashboard() {
  const {
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
    isNextPhaseDisabled,
    handleAddPlayer,
    handleDeletePlayer,
    handleNextPhase,
    handleUndoPhase,
    fetchPlayers,
    fetchStats,
    fetchRounds,
  } = useDashboard();

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
              onRefresh={fetchPlayers}
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