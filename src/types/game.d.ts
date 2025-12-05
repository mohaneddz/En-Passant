export interface Game {
	white: number;
	black: number;
	status: 'PENDING' | 'DRAW' | 'WHITE_WINS' | 'BLACK_WINS';
	presence: number;
	round: number;
}
