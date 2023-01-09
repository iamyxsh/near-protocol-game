import React, { useEffect, useState } from "react"
import {
	NearEnvironment,
	NearEnvironmentProvider,
	NearProvider,
} from "react-near"
import { Input, PageHOC } from "../components"
import { CONTRACT_ADDRESS } from "../constants"
import { useUser } from "../context"
import { useGame } from "../context/game"

type Props = {}

const Homepage = (props: Props) => {
	const [start, setStart] = useState(false)
	const [game, setGame] = useState("")
	const { createGame } = useGame()

	return (
		<PageHOC>
			<div className="h-full flex flex-col justify-center items-center">
				<h1
					onClick={() => setStart(true)}
					className={`text-4xl text-white font-bold font-mono`}
				>
					<span className="animate-bounce hover:text-5xl duration-200 cursor-pointer">
						Start a game
					</span>
				</h1>
				<div className="w-[25%]">
					<Input
						value={game}
						onChange={(e: any) => setGame(e.target.value)}
						placeholder="Enter the name and press Enter"
						className={`my-7 text-center text-2xl focus:placeholder:invisible animate-fade placeholder:text-center placeholder:text-2xl placeholder-slate-200 animate-bounce pl-0 ${
							start ? "visible" : "invisible"
						}`}
						link={`/game?name=${game}`}
						onPress={() => {
							createGame(game)
						}}
					/>
				</div>
			</div>
		</PageHOC>
	)
}

export default Homepage
