use std::time::Duration;
use super::types::{ActivePlayer, AllGameData, GameData};

#[derive(Clone, Debug)]
pub struct LiveClient {
    client: reqwest::Client,
    base_url: String,
}

impl Default for LiveClient {
    fn default() -> Self {
        Self::new()
    }
}

impl LiveClient {
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .danger_accept_invalid_certs(true)
            .timeout(Duration::from_millis(1500))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        Self {
            client,
            base_url: "https://127.0.0.1:2999/liveclientdata".to_string(),
        }
    }

    pub fn with_custom_host(host_and_port: &str) -> Self {
        let client = reqwest::Client::builder()
            .danger_accept_invalid_certs(true)
            .timeout(Duration::from_millis(1500))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        Self {
            client,
            base_url: format!("https://{}/liveclientdata", host_and_port),
        }
    }

    /// Fetches all game data from `/liveclientdata/allgamedata`
    pub async fn get_all_game_data(&self) -> Result<AllGameData, String> {
        let url = format!("{}/allgamedata", self.base_url);
        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("LiveClientData request failed: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("LiveClientData returned status {}", resp.status()));
        }

        let data: AllGameData = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse allgamedata JSON: {}", e))?;
        Ok(data)
    }

    /// Fetches active player information from `/liveclientdata/activeplayer`
    pub async fn get_active_player(&self) -> Result<ActivePlayer, String> {
        let url = format!("{}/activeplayer", self.base_url);
        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("LiveClientData activeplayer request failed: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!(
                "LiveClientData activeplayer returned status {}",
                resp.status()
            ));
        }

        let data: ActivePlayer = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse activeplayer JSON: {}", e))?;
        Ok(data)
    }

    /// Fetches game stats from `/liveclientdata/gamestats`
    pub async fn get_game_stats(&self) -> Result<GameData, String> {
        let url = format!("{}/gamestats", self.base_url);
        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("LiveClientData gamestats request failed: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!(
                "LiveClientData gamestats returned status {}",
                resp.status()
            ));
        }

        let data: GameData = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse gamestats JSON: {}", e))?;
        Ok(data)
    }
}
