use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LazyOption;
use near_sdk::{near_bindgen, Balance, Gas};

mod deploy;

const DEFAULT_CONTRACT: &[u8] = include_bytes!("../wasm/game.wasm");
const TGAS: Gas = Gas(10u64.pow(12));

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    code: LazyOption<Vec<u8>>,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            code: LazyOption::new("code".as_bytes(), Some(&DEFAULT_CONTRACT.to_vec())),
        }
    }
}
