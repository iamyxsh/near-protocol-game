import { providers } from "near-api-js"
import "@near-wallet-selector/modal-ui/styles.css"
import { setupModal } from "@near-wallet-selector/modal-ui"
import LedgerIconUrl from "@near-wallet-selector/ledger/assets/ledger-icon.png"
import MyNearIconUrl from "@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png"
import { setupWalletSelector } from "@near-wallet-selector/core"
import { setupLedger } from "@near-wallet-selector/ledger"
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet"

const THIRTY_TGAS = "30000000000000"
const NO_DEPOSIT = "0"

export class Wallet {
	walletSelector: any
	wallet: any
	network: any
	createAccessKeyFor
	accountId: any

	constructor({ createAccessKeyFor }: any) {
		this.createAccessKeyFor = createAccessKeyFor
		this.network = "testnet"
	}

	async startUp() {
		this.walletSelector = await setupWalletSelector({
			network: this.network,
			modules: [
				setupMyNearWallet({ iconUrl: MyNearIconUrl as any }),
				setupLedger({ iconUrl: LedgerIconUrl as any }),
			],
		})

		const isSignedIn = this.walletSelector.isSignedIn()

		if (isSignedIn) {
			this.wallet = await this.walletSelector.wallet()
			this.accountId =
				this.walletSelector.store.getState().accounts[0].accountId
		}

		return isSignedIn
	}

	async signIn() {
		const description = "Please select a wallet to sign in."
		const modal = setupModal(this.walletSelector, {
			contractId: this.createAccessKeyFor,
			description,
		})
		modal.show()
	}

	signOut() {
		this.wallet.signOut()
		this.wallet = this.accountId = this.createAccessKeyFor = null
		window.location.replace(window.location.origin + window.location.pathname)
	}

	async viewMethod({ contractId, method, args = {} }: any) {
		await this.startUp()
		const { network } = this.walletSelector.options
		const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

		let res = (await provider.query({
			request_type: "call_function",
			account_id: contractId,
			method_name: method,
			args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
			finality: "optimistic",
		})) as any

		return Buffer.from(res.result).toString()
	}

	async callMethod({
		contractId,
		method,
		args = {},
		gas = THIRTY_TGAS,
		deposit = NO_DEPOSIT,
	}: any) {
		try {
			await this.startUp()
			const outcome = await this.wallet.signAndSendTransaction({
				signerId: this.accountId,
				receiverId: contractId,
				actions: [
					{
						type: "FunctionCall",
						params: {
							methodName: method,
							args,
							gas,
							deposit,
						},
					},
				],
			})

			return providers.getTransactionLastResult(outcome)
		} catch (err) {
			console.log("err", err)
		}
	}

	async getTransactionResult(txhash: string) {
		const { network } = this.walletSelector.options
		const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

		const transaction = await provider.txStatus(txhash, "unnused")
		return providers.getTransactionLastResult(transaction)
	}
}
