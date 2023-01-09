use near_sdk::{log, near_bindgen, AccountId, PublicKey};
use near_units::parse_near;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{env, fs};
use workspaces::{Account, Contract};

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum BoardBlocks {
    N,
    X,
    O,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Players {
    one: Option<AccountId>,
    two: Option<AccountId>,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum BoardState {
    Draw,
    Player1Won,
    Player2Won,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let wasm_arg: &str = &(env::args().nth(1).unwrap());
    let wasm_filepath = fs::canonicalize(env::current_dir()?.join(wasm_arg))?;

    let worker = workspaces::sandbox().await?;
    let wasm = std::fs::read(wasm_filepath)?;
    let contract = worker.dev_deploy(&wasm).await?;

    // create accounts
    let account = worker.dev_create_account().await?;
    let alice = account
        .create_subaccount("alice")
        .initial_balance(parse_near!("30 N"))
        .transact()
        .await?
        .into_result()?;

    let bob = account
        .create_subaccount("bob")
        .initial_balance(parse_near!("30 N"))
        .transact()
        .await?
        .into_result()?;

    // begin tests
    test_board_creation(&alice, &contract).await?;
    test_setting_players(&alice, &bob, &contract).await?;
    //test_play_move(&alice, &bob, &contract).await?;
    test_winning(&alice, &bob, &contract).await?;
    test_withdrawing(&alice, &contract).await?;
    Ok(())
}

async fn test_board_creation(user: &Account, contract: &Contract) -> anyhow::Result<()> {
    let board = user
        .call(contract.id(), "get_current_board")
        .args_json(json!({}))
        .transact()
        .await?
        .json::<[BoardBlocks; 9]>()?;

    let state = user
        .call(contract.id(), "get_state")
        .args_json(json!({}))
        .transact()
        .await?
        .json::<BoardState>()?;

    assert_eq!(board, [BoardBlocks::N; 9]);
    assert_eq!(state, BoardState::Draw);

    println!("      Passed ✅ test_board_creation");
    Ok(())
}

async fn test_setting_players(
    user1: &Account,
    user2: &Account,
    contract: &Contract,
) -> anyhow::Result<()> {
    let _: Players = user1
        .call(contract.id(), "set_player_one")
        .args_json(json!({ "player_one" :user1.id() }))
        .deposit(parse_near!("5 N"))
        .transact()
        .await?
        .json()?;

    let bet: u128 = user1
        .call(contract.id(), "get_bet")
        .transact()
        .await?
        .json()?;

    let players: Players = user2
        .call(contract.id(), "set_player_two")
        .args_json(json!({ "player_two" :user2.id() }))
        .deposit(parse_near!("5 N"))
        .transact()
        .await?
        .json()?;

    let id1 = user1.id().to_string();
    let id2 = user2.id().to_string();

    assert_eq!(players.one.unwrap().to_string(), id1);
    assert_eq!(players.two.unwrap().to_string(), id2);
    assert_eq!(bet, parse_near!("5 N"));

    println!("      Passed ✅ test_setting_players");
    Ok(())
}

async fn test_play_move(
    user1: &Account,
    user2: &Account,
    contract: &Contract,
) -> anyhow::Result<()> {
    let board1 = user1
        .call(contract.id(), "play_move")
        .args_json(json!({ "position" : 1 }))
        .transact()
        .await?
        .json::<[BoardBlocks; 9]>()?;

    let turn1: String = user1
        .call(contract.id(), "get_turn")
        .args_json(json!({}))
        .transact()
        .await?
        .json()?;

    let board2 = user2
        .call(contract.id(), "play_move")
        .args_json(json!({ "position" : 3 }))
        .transact()
        .await?
        .json::<[BoardBlocks; 9]>()?;

    let turn2: String = user1
        .call(contract.id(), "get_turn")
        .args_json(json!({}))
        .transact()
        .await?
        .json()?;

    assert_eq!(board1[0], BoardBlocks::X);
    assert_eq!(turn1, user2.id().to_string());
    assert_eq!(board2[2], BoardBlocks::O);
    assert_eq!(turn2, user1.id().to_string());

    println!("      Passed ✅ test_play_move");
    Ok(())
}

async fn test_winning(user1: &Account, user2: &Account, contract: &Contract) -> anyhow::Result<()> {
    let _ = user1
        .call(contract.id(), "play_move")
        .args_json(json!({ "position" : 1 }))
        .transact()
        .await?
        .json::<[BoardBlocks; 9]>()?;

    let _ = user2
        .call(contract.id(), "play_move")
        .args_json(json!({ "position" : 3 }))
        .transact()
        .await?
        .json::<[BoardBlocks; 9]>()?;

    let _ = user1
        .call(contract.id(), "play_move")
        .args_json(json!({ "position" : 4 }))
        .transact()
        .await?
        .json::<[BoardBlocks; 9]>()?;

    let _ = user2
        .call(contract.id(), "play_move")
        .args_json(json!({ "position" : 6 }))
        .transact()
        .await?
        .json::<[BoardBlocks; 9]>()?;

    let _ = user1
        .call(contract.id(), "play_move")
        .args_json(json!({ "position" : 7 }))
        .transact()
        .await?
        .json::<[BoardBlocks; 9]>()?;

    let board = user2
        .call(contract.id(), "get_current_board")
        .args_json(json!({}))
        .transact()
        .await?
        .json::<[BoardBlocks; 9]>()?;

    let board_end = [
        BoardBlocks::X,
        BoardBlocks::N,
        BoardBlocks::O,
        BoardBlocks::X,
        BoardBlocks::N,
        BoardBlocks::O,
        BoardBlocks::X,
        BoardBlocks::N,
        BoardBlocks::N,
    ];

    let state = user1
        .call(contract.id(), "get_state")
        .args_json(json!({}))
        .transact()
        .await?
        .json::<BoardState>()?;

    assert_eq!(state, BoardState::Player1Won);
    assert_eq!(board, board_end);

    println!("      Passed ✅ test_winning");
    Ok(())
}

async fn test_withdrawing(user1: &Account, contract: &Contract) -> anyhow::Result<()> {
    let _ = user1
        .call(contract.id(), "withdraw")
        .args_json(json!({}))
        .transact()
        .await?;

    assert!(user1.view_account().await?.balance > parse_near!("30 N"));

    println!("      Passed ✅ test_withdrawing");
    Ok(())
}
