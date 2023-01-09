import React from "react"
import { COLORS } from "../../../constants"

type Props = {
	onClick?: any
	label: string
	className?: string
}

const Button = ({ label, className, onClick }: Props) => {
	return (
		<div
			onClick={() => onClick()}
			className={`bg-[${COLORS.primary}] border-white border-[0.3rem] w-[10rem] h-auto px-5 cursor-pointer text-center py-2 text-white ${className}`}
		>
			{label}
		</div>
	)
}

export default Button
