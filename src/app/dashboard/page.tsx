"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import StatsGrid from '@/components/dashboard/StatsGrid';
import TabNavigation from '@/components/dashboard/TabNavigation';
import AddPlayerForm from '@/components/dashboard/AddPlayerForm';
import PlayersTable from '@/components/dashboard/PlayersTable';
import { getPlayers, addPlayer, deletePlayer, LeaderboardEntry, getStats } from '@/lib/api';

interface Player {
  id: string;
  name: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
}

export default function ChessDashboard() {
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{totalPlayers: number | null, totalRounds: number | null, gamesPlayed: number | null, currentRound: number | null}>({
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
  const fetchPlayers = async () => {
    try {
      const data = await getPlayers();
      // Map LeaderboardEntry to Player interface if needed, or just use data if it matches
      // LeaderboardEntry has: id, name, is_active, points, wins, draws, losses, buchholz
      // Player has: id, name, points, wins, losses, draws
      // They match enough for our UI needs
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
  }, []);

  const handleAddPlayer = async (newPlayer: Omit<Player, 'id'>) => {
    try {
      await addPlayer(newPlayer.name);
      await fetchPlayers(); // Refresh list
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const handleEditPlayer = (player: Player) => {
    console.log('Edit player:', player);
  };

  const handleDeletePlayer = async (id: string) => {
    try {
      await deletePlayer(id);
      await fetchPlayers(); // Refresh list
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#111]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-8 py-10">
        <StatsGrid stats={stats} />
        
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === 'players' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AddPlayerForm onAddPlayer={handleAddPlayer} />
            <PlayersTable 
              players={players}
              onEdit={handleEditPlayer}
              onDelete={handleDeletePlayer}
            />
          </div>
        )}
        
        {activeTab === 'games' && (
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-gray-500">Games & Rounds content will go here</p>
          </div>
        )}
      </main>
    </div>
  );
}