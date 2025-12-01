export type GameStatusColor = "yellow" | "green" | "gray";

export interface Game {
    gameNumber: number;
    whitePlayer: string;
    blackPlayer: string;
    status: string;
    statusColor?: GameStatusColor;
}

export interface Round {
    id: string;
    label: string;
    status: string;
    games: Game[];
}
