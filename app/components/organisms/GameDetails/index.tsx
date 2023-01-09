import Image from "next/image"
import React, { useEffect, useState } from "react"
import { assets } from "../../../assets"
import { useGame, useUser } from "../../../context"
import { Button } from "../../atoms"

type Props = {
	name: string
	players: any
}

const GameDetails = ({ name, players }: Props) => {
	const { setPlayerTwo, getBet } = useGame()
	const { user } = useUser()
	const [bet, setBet] = useState<any>()

	useEffect(() => {
		const fetch = async () => {
			const b = await getBet(name)
			setBet(b)
		}
		fetch()
	}, [])

	return (
		<div className="flex h-full flex-col justify-center gap-5 items-center">
			<div className="text-[4rem] capitalize text-white">Name: {name}</div>
			<div className="flex items-center gap-2 text-[2.5rem] capitalize text-white">
				<h1>Bet: {bet / 1e24}</h1>
				<Image
					src={assets.near}
					width={20}
					height={20}
					className="w-[2.5rem] h-[2.5rem]"
					alt="near"
				/>
			</div>
			<div>
				<Button
					label="Accept"
					className="border-white text-xl border-opacity-10"
					onClick={() => setPlayerTwo(name, user)}
				/>
			</div>
		</div>
	)
}

export default GameDetails
