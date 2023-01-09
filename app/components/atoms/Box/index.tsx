import React from "react"
import { GameMark } from "../../../types"

type Props = {
	type: GameMark
	onClick: any
}

const Box = ({ type, onClick }: Props) => {
	return (
		<div className="flex justify-center items-center h-full">
			<div
				onClick={() => onClick()}
				className={`h-[8rem] w-[8rem] ${
					type != GameMark.N ? "clicked" : "unclicked"
				} rounded-md flex justify-center items-center cursor-pointer`}
			>
				<h1
					className={`
						text-[4rem]
					 text-white font-extrabold`}
				>
					{type !== GameMark.N && type}
				</h1>
			</div>
		</div>
	)
}

export default Box
