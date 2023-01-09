import React, { useState } from "react"
import { useGame } from "../../../context"
import { GameBoard, GameMark } from "../../../types"
import { Box } from "../../atoms"

type Props = {
	box: any
	turn: any
	setTurn: any
	setBox: React.Dispatch<React.SetStateAction<GameBoard>>
	getBox: any
	name: any
	checkWinner: any
}

const GameBox = ({
	name,
	turn,
	setTurn,
	box,
	setBox,
	getBox,
	checkWinner,
}: Props) => {
	const { playMove } = useGame()

	return (
		<div className="flex flex-col gap-10 w-full h-full items-center justify-center">
			<h1 className="text-4xl text-white">Turn : {turn}</h1>
			<div className="flex flex-col gap-5 justify-around">
				<div className="flex gap-5 justify-around">
					<Box
						onClick={async () => {
							await playMove(name, 1)
							await await setTurn()
							await getBox()
							await checkWinner()
						}}
						type={box[0]}
					/>
					<Box
						onClick={async () => {
							await playMove(name, 2)
							await await setTurn()
							await getBox()
							await checkWinner()
						}}
						type={box[1]}
					/>
					<Box
						onClick={async () => {
							await playMove(name, 3)
							await await setTurn()
							await getBox()
							await checkWinner()
						}}
						type={box[2]}
					/>
				</div>
				<div className="flex gap-5 justify-around">
					<Box
						onClick={async () => {
							await playMove(name, 4)
							await await setTurn()
							await getBox()
							await checkWinner()
						}}
						type={box[3]}
					/>
					<Box
						onClick={async () => {
							await playMove(name, 5)
							await await setTurn()
							await getBox()
							await checkWinner()
						}}
						type={box[4]}
					/>
					<Box
						onClick={async () => {
							await playMove(name, 6)
							await await setTurn()
							await getBox()
							await checkWinner()
						}}
						type={box[5]}
					/>
				</div>
				<div className="flex gap-5 justify-around">
					<Box
						onClick={async () => {
							await playMove(name, 7)
							await await setTurn()
							await getBox()
							await checkWinner()
						}}
						type={box[6]}
					/>
					<Box
						onClick={async () => {
							await playMove(name, 8)
							await await setTurn()
							await getBox()
							await checkWinner()
						}}
						type={box[7]}
					/>
					<Box
						onClick={async () => {
							await playMove(name, 9)
							await await setTurn()
							await getBox()
							await checkWinner()
						}}
						type={box[8]}
					/>
				</div>
			</div>
		</div>
	)
}

export default GameBox
