import * as React from "react"
import { CONTRACT_ADDRESS } from "../constants"
import { User, UserContextType } from "../types"
import { Wallet } from "../utils/wallet"

export const UserContext = React.createContext<UserContextType | null>(null)

export const UserProvider: React.FC<any> = ({ children, solana }) => {
	const [user, setUser] = React.useState<string>("")
	const wallet = new Wallet({ createAccessKeyFor: CONTRACT_ADDRESS })
	const [isSignedIn, setSignedIn] = React.useState(false)

	React.useEffect(() => {
		const fetchUser = async () => {
			await wallet.startUp()
			setUser(wallet.accountId)
		}
		fetchUser()
	}, [])

	const connectWallet = async () => {
		await wallet.startUp()
		await wallet.signIn()
		setUser(wallet.accountId)
	}

	const disconnectWallet = async () => {
		if (solana) {
			await solana.disconnect()
			setUser("")
		}
	}

	const removeAddress = () => {
		setUser("")
	}

	return (
		<UserContext.Provider
			value={{
				user,
				removeAddress,
				connectWallet,
				disconnectWallet,
				isSignedIn,
			}}
		>
			{children}
		</UserContext.Provider>
	)
}

export const useUser = () => React.useContext(UserContext) as UserContextType
