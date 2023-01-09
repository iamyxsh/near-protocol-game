import type { NextApiRequest, NextApiResponse } from "next"
import * as nearAPI from "near-api-js"
const { keyStores } = nearAPI
const myKeyStore = new keyStores.InMemoryKeyStore()

const { connect } = nearAPI
const { Contract } = nearAPI

type Data = {
	status: boolean
}

import { CONTRACT_ADDRESS } from "../../constants"

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	switch (req.method) {
		case "GET":
			const connectionConfig = {
				networkId: "testnet", // first create a key store
				nodeUrl: "https://rpc.testnet.near.org",
				walletUrl: "https://wallet.testnet.near.org",
				helperUrl: "https://helper.testnet.near.org",
				explorerUrl: "https://explorer.testnet.near.org",
				keyStore: myKeyStore,
			}
			const nearConnection = await connect(connectionConfig)
			const account = await nearConnection.account("iamyash.testnet")

			const contract = new Contract(
				account, // the account object that is connecting
				`${req.query.name}.${CONTRACT_ADDRESS}`,
				{
					// name of contract you're connecting to
					viewMethods: ["get_current_board"], // view methods do not change state but usually return a value
					changeMethods: [""], // change methods modify state
				}
			)

			try {
				await contract.get_current_board()
				res.status(200).json({ status: true })
			} catch (err) {
				res.status(500).json({ status: false })
			}
		default:
			break
	}
}
