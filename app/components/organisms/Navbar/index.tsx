import Link from "next/link"
import React from "react"
import { Button } from "../.."
import { useUser } from "../../../context"

const Navbar = () => {
	const { connectWallet, user } = useUser()

	return (
		<div
			className={`h-[4rem] px-10 bg-white flex justify-between items-center`}
		>
			<Link href={"/"}>
				<h1 className={`text-[#60C1ED] text-3xl`}>tiker</h1>
			</Link>
			<ul className="flex justify-end items-center">
				<li>
					<Button
						onClick={connectWallet}
						label={user ? user : "Connect Wallet"}
					/>
				</li>
			</ul>
		</div>
	)
}

export default Navbar
