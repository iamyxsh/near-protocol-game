use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json::json;
use near_sdk::{
    env, log, near_bindgen, require, AccountId, Balance, Promise, PromiseError, PublicKey,
};
use near_units::parse_near;

use crate::{Contract, ContractExt, TGAS};

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct InitArgs {
    player_one: AccountId,
}

const NEAR_PER_STORAGE: Balance = 10_000_000_000_000_000_000; // 10e18yⓃ

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn create_factory_subaccount_and_deploy(&mut self, name: String) -> Promise {
        let current_account = env::current_account_id().to_string();
        let subaccount: AccountId = format!("{name}.{current_account}").parse().unwrap();
        let b = env::is_valid_account_id(subaccount.as_bytes());

        log!(format!("Valid Account {b}"));

        require!(
            env::is_valid_account_id(subaccount.as_bytes()),
            "Invalid subaccount"
        );

        let attached = env::attached_deposit();

        let code = self.code.get().unwrap();
        let contract_bytes = code.len() as u128;
        let minimum_needed = NEAR_PER_STORAGE * contract_bytes;
        log!(format!("Min needed: {minimum_needed}"));
        require!(attached > minimum_needed, "Not enough balance.");

        let init_args = near_sdk::serde_json::to_vec(&InitArgs {
            player_one: env::signer_account_id(),
        })
        .unwrap();

        let mut promise = Promise::new(subaccount.clone())
            .create_account()
            .transfer(attached)
            .deploy_contract(code)
            .function_call("set_player_one".to_owned(), init_args, attached, TGAS * 5);

        promise
    }

    #[private] // Public - but only callable by env::current_account_id()
    pub fn query_greeting_callback(
        &self,
        #[callback_result] call_result: Result<String, PromiseError>,
    ) -> String {
        // Check if the promise succeeded by calling the method outlined in external.rs
        if call_result.is_err() {
            log!("There was an error contacting Hello NEAR");
            return "".to_string();
        }

        // Return the greeting
        let greeting: String = call_result.unwrap();
        greeting
    }
}
