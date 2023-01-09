import React, { useEffect, useState } from "react"
import { Box, PageHOC, Gamebox, GameDetails, GameWinner } from "../components"
import { useGame, useUser } from "../context"
import { GameBoard, GameMark } from "../types"
import { useRouter } from "next/router"

const Game = () => {
	const { query } = useRouter()
	const [name, setName] = useState("")
	const [box, setBox] = useState<GameBoard>([
		GameMark.N,
		GameMark.N,
		GameMark.N,
		GameMark.N,
		GameMark.N,
		GameMark.N,
		GameMark.N,
		GameMark.N,
		GameMark.N,
	])
	const [turn, setTurn] = useState("")
	const [winner, setWinner] = useState("")
	const [players, setPlayers] = useState({ one: "", two: "" })
	const { getGameBox, getPlayers, getTurn, getState } = useGame()

	useEffect(() => {
		if (query.name) {
			setName(query.name! as string)
		}
	}, [query.name])

	useEffect(() => {
		if (name) {
			fetchBox()
			fetchPlayers()
			fetchTurn()
			checkWinner()
		}
	}, [name])

	const fetchBox = async () => {
		const box = await getGameBox(name! as string)
		setBox(JSON.parse(box as unknown as string))
	}

	const fetchPlayers = async () => {
		const players = await getPlayers(name! as string)
		setPlayers(JSON.parse(players as any))
	}

	const fetchTurn = async () => {
		const turn = await getTurn(name)
		setTurn(turn!)
	}

	const checkWinner = async () => {
		const state = (await getState(name)) as unknown as string
		setWinner(JSON.parse(state))
	}

	return (
		<PageHOC>
			{players.two === null ? (
				<GameDetails players={players} name={name as string} />
			) : winner !== "" && winner === "draw" ? (
				<Gamebox
					turn={turn}
					setTurn={fetchTurn}
					setBox={setBox}
					getBox={fetchTurn}
					box={box}
					name={name}
					checkWinner={checkWinner}
				/>
			) : winner !== "draw" ? (
				<GameWinner winner={winner} name={name} />
			) : (
				<></>
			)}
		</PageHOC>
	)
}

export default Game
