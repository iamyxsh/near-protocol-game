export interface User {
	walletAddress: string
}

export interface UserContextType {
	user: string
	isSignedIn: boolean
	connectWallet: () => void
	removeAddress: () => void
	disconnectWallet: () => void
}

export interface GameContextType {
	getGameBox: (name: string) => Promise<GameBoard | undefined>
	createGame: (name: string) => Promise<void>
	setPlayerTwo: (name: string, player_two: string) => Promise<void>
	getPlayers: (name: string) => Promise<string | undefined>
	getBet: (name: string) => Promise<string | undefined>
	getTurn: (name: string) => Promise<string | undefined>
	getState: (name: string) => Promise<string | undefined>
	playMove: (name: string, position: number) => Promise<void>
	withdraw: (name: string) => Promise<void>
}

export interface UiContexType {
	loader: boolean
	toggleLoader: () => void
}

export enum GameMark {
	X = "X",
	N = "N",
	O = "O",
}

export type GameBoard = GameMark[]
