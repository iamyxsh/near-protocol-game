import React, { HTMLInputTypeAttribute } from "react"
import { COLORS } from "../../../constants"
import { useRouter } from "next/router"

interface Props {
	type?: string
	placeholder: string
	className?: string
	value: string
	onChange: any
	link: string
	onPress: any
}

const Input = ({
	onChange,
	placeholder,
	className,
	type = "text",
	value,
	link,
	onPress,
}: Props) => {
	return (
		<input
			value={value}
			className={`w-full text-white focus:outline-none border-b-2 placeholder-white bg-[${COLORS.primary}] h-10 py-7 px-5 ${className}`}
			placeholder={placeholder}
			type={type}
			onChange={onChange}
			onKeyUp={(e) => e.key === "Enter" && onPress(link)}
		/>
	)
}

export default Input
