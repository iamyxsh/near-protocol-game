import React from "react"
import { useGame } from "../../../context"
import { Button } from "../../atoms"

type Props = {
	winner: string
	name: string
}

const GameWinner = ({ winner, name }: Props) => {
	const { withdraw } = useGame()

	return (
		<div className="flex gap-5 h-full flex-col justify-center items-center">
			<h1 className="text-3xl text-white">
				Congrats!! {winner}. You have won this game.
			</h1>
			<Button
				label="Withdraw"
				className="border-white text-xl border-opacity-10"
				onClick={() => withdraw(name)}
			/>
		</div>
	)
}

export default GameWinner
