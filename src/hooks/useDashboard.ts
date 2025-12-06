import { useState, useEffect, useRef } from 'react';
import { getPlayers, addPlayer, deletePlayer, editPlayer, restorePlayer,resetAllPlayers } from '@/server/players';
import { getStats, StatsGridProps } from '@/server/stats';
import { generateNextRound } from '@/server/actions';
import { GamesListRef } from '@/components/dashboard/GamesList';

import { Player } from '@/types/player';

export const useDashboard = () => {
	const [activeTab, setActiveTab] = useState('players');
	const [players, setPlayers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(true);
	const [showNextPhaseDialog, setShowNextPhaseDialog] = useState(false);
	const [showUndoDialog, setShowUndoDialog] = useState(false);
	const gamesListRef = useRef<GamesListRef>(null);

	const handleRestorePlayer = async (id: number) => {
		try {
			await restorePlayer(id);
			await fetchPlayers();
		} catch (error) {
			console.error('Error restoring player:', error);
		}
	};

	const handleResetAllPlayers = async () => {
		try {
			await resetAllPlayers();
			await fetchPlayers();
		} catch (error) {
			console.error('Error resetting players:', error);
		}
	}

	const [stats, setStats] = useState<StatsGridProps['stats']>({
		totalPlayers: null,
		totalRounds: null,
		gamesPlayed: null,
		totalGames: null,
	});

	const fetchStats = async () => {
		try {
			const data = await getStats();
			// @ts-ignore - ignoring potential null/undefined mismatches from direct DB return
			setStats(data);
		} catch (error) {
			console.error('Error fetching stats:', error);
		}
	};

	const fetchRounds = async () => {
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

	const isNextPhaseDisabled = false;

	const handleAddPlayer = async (newPlayer: { name: string, rating: number }) => {
		try {
			await addPlayer(newPlayer.name, newPlayer.rating);
			await fetchPlayers();
		} catch (error) {
			console.error('Error adding player:', error);
		}
	};

	const handleDeletePlayer = async (id: number) => {
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

	// const handleUndoPhase = async () => {
	// 	try {
	// 		setLoading(true);
	// 		const result = await undoLastRound();
	// 		if (result.success) {
	// 			await fetchStats();
	// 			await fetchRounds();
	// 			await fetchPlayers();
	// 			setShowUndoDialog(false);
	// 		} else {
	// 			console.error('Error undoing phase:', result.error);
	// 		}
	// 	} catch (error) {
	// 		console.error('Error undoing phase:', error);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	return {
		activeTab,
		setActiveTab,
		players,
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
		// handleUndoPhase,
		fetchPlayers,
		fetchStats,
		fetchRounds,
		handleRestorePlayer,
		handleResetAllPlayers
	};
};
