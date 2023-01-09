use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, log, near_bindgen, require, AccountId, Balance, Promise, PublicKey};

#[derive(
    BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Copy, Debug, PartialEq,
)]
pub enum BoardBlocks {
    N,
    X,
    O,
}

impl Default for BoardBlocks {
    fn default() -> Self {
        Self::N
    }
}

#[derive(
    BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Copy, Debug, PartialEq,
)]
pub enum BoardState {
    Draw,
    Player1Won,
    Player2Won,
}

impl Default for BoardState {
    fn default() -> Self {
        Self::Draw
    }
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Players {
    one: Option<AccountId>,
    two: Option<AccountId>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    pub board: [BoardBlocks; 9],
    pub players: Players,
    pub turn: Option<AccountId>,
    pub state: Option<BoardState>,
    pub bet: Option<u128>,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            board: [BoardBlocks::N; 9],
            players: Players {
                one: None,
                two: None,
            },
            turn: None,
            state: Some(BoardState::Draw),
            bet: None,
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn get_current_board(&self) -> [BoardBlocks; 9] {
        return self.board;
    }

    pub fn get_players(&self) -> Players {
        return self.players.clone();
    }

    pub fn get_turn(&self) -> Option<AccountId> {
        return self.turn.clone();
    }

    pub fn get_state(&self) -> String {
        if self.state.unwrap() == BoardState::Draw {
            return "draw".to_string();
        } else if self.state.unwrap() == BoardState::Player1Won {
            return self.players.clone().one.unwrap().to_string();
        } else {
            return self.players.clone().two.unwrap().to_string();
        }
    }

    pub fn get_bet(&self) -> Option<u128> {
        return self.bet;
    }

    pub fn get_acc_balance(&self) -> Balance {
        return env::account_balance();
    }

    #[payable]
    pub fn set_player_one(&mut self, player_one: AccountId) -> Players {
        require!(self.players.one == None, "Player One already initialized.");
        self.players.one = Some(player_one);
        self.bet = Some(env::attached_deposit());
        self.turn = Some(self.players.clone().one.unwrap());
        return self.players.clone();
    }

    #[payable]
    pub fn set_player_two(&mut self, player_two: AccountId) -> Players {
        require!(self.players.two == None, "Player Two already initialized.");
        require!(
            env::attached_deposit() == self.bet.unwrap(),
            "Please send more NEAR tokens"
        );
        self.bet = Some(self.bet.unwrap() + env::attached_deposit());
        self.players.two = Some(player_two);
        return self.players.clone();
    }

    #[payable]
    pub fn play_move(&mut self, position: usize) -> [BoardBlocks; 9] {
        require!(position >= 1 && position <= 9, "Position is out of bound.");
        require!(
            self.state.unwrap() == BoardState::Draw,
            "Game already ended"
        );
        require!(self.turn.clone().unwrap() == env::signer_account_id());

        self.board[position - 1] =
            if self.turn.clone().unwrap() == self.players.clone().one.unwrap() {
                BoardBlocks::X
            } else {
                BoardBlocks::O
            };

        if has_won(self.board) {
            self.state = if self.turn.clone().unwrap() == self.players.clone().one.unwrap() {
                Some(BoardState::Player1Won)
            } else {
                Some(BoardState::Player2Won)
            };
            return self.board;
        }

        self.turn = if self.turn.clone().unwrap() == self.players.clone().one.unwrap() {
            self.players.clone().two
        } else {
            self.players.clone().one
        };

        self.board
    }

    #[payable]
    pub fn withdraw(&mut self) -> Promise {
        require!(
            self.state.unwrap() != BoardState::Draw,
            "Game has not ended."
        );
        require!(self.bet.unwrap() != 0, "Already winthdrawn.");
        let players = self.players.clone();
        if self.state.unwrap() == BoardState::Player1Won {
            require!(
                env::signer_account_id() == players.one.unwrap(),
                "You are not the winner."
            );
        } else {
            require!(
                env::signer_account_id() == players.two.unwrap(),
                "You are not the winner."
            );
        }

        let bet = u128::from(self.bet.unwrap())
            - u128::from(u128::from(env::storage_usage()) * env::storage_byte_cost());

        self.bet = Some(0);

        Promise::new(env::signer_account_id()).transfer(bet)
    }
}

fn has_won(board: [BoardBlocks; 9]) -> bool {
    for tmp in 0..3 {
        if board[tmp] == board[tmp + 3]
            && board[tmp] == board[tmp + 6]
            && board[tmp] != BoardBlocks::N
        {
            return true;
        }

        let tmp = tmp * 3;

        if board[tmp] == board[tmp + 1]
            && board[tmp] == board[tmp + 2]
            && board[tmp] != BoardBlocks::N
        {
            return true;
        }
    }

    if (board[0] == board[4] && board[0] == board[8] && board[0] != BoardBlocks::N)
        || (board[2] == board[4] && board[2] == board[6] && board[2] != BoardBlocks::N)
    {
        return true;
    }
    false
}

#[cfg(test)]
mod tests {
    use std::ffi::c_long;

    use super::*;
    use colored::*;

    const ALICE: &str = "alice.testnet";
    const BOB: &str = "bob.testnet";

    #[test]
    fn can_start_game() {
        let contract = Contract::default();

        let board = contract.get_current_board();

        let default_board = [BoardBlocks::N; 9];

        assert_eq!(
            board.len(),
            default_board.len(),
            "Arrays don't have the same length"
        );
        assert!(
            board.iter().zip(default_board.iter()).all(|(a, b)| a == b),
            "Arrays are not equal"
        );

        println!("Passed ✅ - {}", "can_start_game".on_green().white());
    }

    #[test]
    fn can_init_player1() {
        let mut contract = Contract::default();

        let players = contract.set_player_one(ALICE.parse().unwrap());

        assert_eq!(players.one.unwrap().as_str(), ALICE);

        println!("Passed ✅ - {}", "can_init_player1".on_green().white());
    }

    #[test]
    fn can_add_player2() {
        let mut contract = Contract::default();

        let players = contract.set_player_two(BOB.parse().unwrap());

        assert_eq!(players.two.unwrap().as_str(), BOB);

        println!("Passed ✅ - {}", "can_add_player2".on_green().white());
    }

    #[test]
    fn can_play_move() {
        let mut contract = Contract::default();
        let _ = contract.set_player_one("bob.near".parse().unwrap());
        let _ = contract.set_player_two("alice.near".parse().unwrap());

        let board = contract.play_move(1);

        assert_eq!(board[0], BoardBlocks::X);
        assert_eq!(contract.turn.unwrap().as_str(), "alice.near");

        println!("Passed ✅ - {}", "can_play_move".on_green().white());
    }

    #[test]
    fn can_return_winner() {
        let board = [
            BoardBlocks::X,
            BoardBlocks::X,
            BoardBlocks::X,
            BoardBlocks::O,
            BoardBlocks::O,
            BoardBlocks::O,
            BoardBlocks::O,
            BoardBlocks::O,
            BoardBlocks::O,
        ];

        let won = has_won(board);

        assert_eq!(won, true);

        println!("Passed ✅ - {}", "can_return_winner".on_green().white());
    }
}
