import "../styles/globals.css"
import type { AppProps } from "next/app"
import React, { useEffect } from "react"
import { CONTRACT_ADDRESS } from "../constants"
import "@near-wallet-selector/modal-ui/styles.css"
import { UserProvider } from "../context"
import { GameProvider } from "../context/game"
import { Wallet } from "../utils/wallet"
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer } from "react-toastify"

export default function App({ Component, pageProps }: AppProps) {
	const wallet = new Wallet({ createAccessKeyFor: CONTRACT_ADDRESS })

	useEffect(() => {
		;(async () => {
			await wallet.startUp()
		})()
	}, [])

	return (
		<GameProvider>
			<UserProvider>
				<Component {...pageProps} />
				<ToastContainer />
			</UserProvider>
		</GameProvider>
	)
}
