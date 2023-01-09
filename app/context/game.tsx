import { useRouter } from "next/router"
import * as React from "react"
import { toast } from "react-toastify"
import { CONTRACT_ADDRESS } from "../constants"
import { GameBoard, GameContextType, User, UserContextType } from "../types"
import { Wallet } from "../utils/wallet"

export const GameContext = React.createContext<GameContextType | null>(null)

export const GameProvider: React.FC<any> = ({ children }) => {
	const wallet = new Wallet({ createAccessKeyFor: CONTRACT_ADDRESS })
	const { push } = useRouter()

	const getGameBox = async (name: string) => {
		try {
			const board = (await wallet.viewMethod({
				contractId: `${name}.${CONTRACT_ADDRESS}`,
				method: "get_current_board",
			})) as unknown as GameBoard

			return board
		} catch (err) {
			console.log("err", err)
		}
	}

	const createGame = async (name: string) => {
		try {
			const { status } = await fetch(`/api/subaccount?name=${name}`).then(
				(res) => res.json()
			)
			if (status) {
				push(`/game?name=${name}`)
				toast.info("Game already exists", { position: "top-center" })
			} else {
				await wallet.callMethod({
					contractId: CONTRACT_ADDRESS,
					method: "create_factory_subaccount_and_deploy",
					args: { name: name },
					deposit: "5000000000000000000000000",
				})

				push(`/game?name=${name}`)
			}
		} catch (err) {
			toast.error("Something went wrong.", { position: "top-center" })
			console.log("err", err)
		}
	}

	const setPlayerTwo = async (name: string, player_two: string) => {
		try {
			let bet = await wallet.viewMethod({
				method: "get_bet",
				contractId: `${name}.${CONTRACT_ADDRESS}`,
			})

			await wallet.callMethod({
				method: "set_player_two",
				contractId: `${name}.${CONTRACT_ADDRESS}`,
				args: { player_two },
				deposit: bet,
			})
		} catch (err) {
			toast.error("Something went wrong.", { position: "top-center" })
			console.log("err", err)
		}
	}

	const getPlayers = async (name: string) => {
		try {
			let players = await wallet.viewMethod({
				method: "get_players",
				contractId: `${name}.${CONTRACT_ADDRESS}`,
			})

			return players
		} catch (err) {
			console.log("err", err)
		}
	}

	const getBet = async (name: string) => {
		try {
			let bet = await wallet.viewMethod({
				method: "get_bet",
				contractId: `${name}.${CONTRACT_ADDRESS}`,
			})

			return bet
		} catch (err) {
			toast.error("Something went wrong.", { position: "top-center" })
			console.log("err", err)
		}
	}

	const getTurn = async (name: string) => {
		try {
			let turn = await wallet.viewMethod({
				method: "get_turn",
				contractId: `${name}.${CONTRACT_ADDRESS}`,
			})

			return turn
		} catch (err) {
			toast.error("Something went wrong.", { position: "top-center" })
			console.log("err", err)
		}
	}

	const getState = async (name: string) => {
		try {
			let turn = await wallet.viewMethod({
				method: "get_state",
				contractId: `${name}.${CONTRACT_ADDRESS}`,
			})

			return turn
		} catch (err) {
			toast.error("Something went wrong.", { position: "top-center" })
			console.log("err", err)
		}
	}

	const playMove = async (name: string, position: number) => {
		try {
			await wallet.callMethod({
				method: "play_move",
				contractId: `${name}.${CONTRACT_ADDRESS}`,
				args: { position },
			})
		} catch (err) {
			toast.error("Something went wrong.", { position: "top-center" })
			console.log("err", err)
		}
	}

	const withdraw = async (name: string) => {
		try {
			await wallet.callMethod({
				method: "withdraw",
				contractId: `${name}.${CONTRACT_ADDRESS}`,
			})
		} catch (err) {
			toast.error("Something went wrong.", { position: "top-center" })
			console.log("err", err)
		}
	}

	return (
		<GameContext.Provider
			value={{
				getGameBox,
				createGame,
				setPlayerTwo,
				getPlayers,
				getBet,
				getTurn,
				playMove,
				getState,
				withdraw,
			}}
		>
			{children}
		</GameContext.Provider>
	)
}

export const useGame = () => React.useContext(GameContext) as GameContextType
