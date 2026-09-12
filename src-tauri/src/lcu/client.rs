use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};
use std::time::Duration;

use super::lockfile::generate_basic_auth_header;
use super::types::{ChampSelectSession, LockfileInfo};

#[derive(Clone, Debug)]
pub struct LcuClient {
    client: reqwest::Client,
    base_url: String,
    pub lockfile: LockfileInfo,
}

impl LcuClient {
    pub fn new(lockfile: LockfileInfo) -> Result<Self, String> {
        let mut headers = HeaderMap::new();
        let auth_header_val = generate_basic_auth_header(&lockfile.auth_token);
        headers.insert(
            AUTHORIZATION,
            HeaderValue::from_str(&auth_header_val)
                .map_err(|e| format!("Invalid auth header: {}", e))?,
        );

        let client = reqwest::Client::builder()
            .danger_accept_invalid_certs(true)
            .default_headers(headers)
            .timeout(Duration::from_millis(2500))
            .build()
            .map_err(|e| format!("Failed to build HTTP client: {}", e))?;

        let base_url = format!("https://127.0.0.1:{}", lockfile.port);

        Ok(Self {
            client,
            base_url,
            lockfile,
        })
    }

    /// Fetches current Gameflow phase from `/lol-gameflow/v1/gameflow-phase`
    pub async fn get_gameflow_phase(&self) -> Result<String, String> {
        let url = format!("{}/lol-gameflow/v1/gameflow-phase", self.base_url);
        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("LCU request failed: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("LCU returned status {}", resp.status()));
        }

        let raw_text = resp
            .text()
            .await
            .map_err(|e| format!("Failed to read response text: {}", e))?;
        let clean_phase = raw_text.trim().trim_matches('"').to_string();
        Ok(clean_phase)
    }

    /// Fetches active Champ Select session from `/lol-champ-select/v1/session`
    pub async fn get_champ_select_session(&self) -> Result<ChampSelectSession, String> {
        let url = format!("{}/lol-champ-select/v1/session", self.base_url);
        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("LCU request failed: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("LCU returned status {}", resp.status()));
        }

        let session: ChampSelectSession = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse champ select session JSON: {}", e))?;
        Ok(session)
    }

    /// Fetches logged-in summoner profile from `/lol-summoner/v1/current-summoner`
    pub async fn get_current_summoner(&self) -> Result<serde_json::Value, String> {
        let url = format!("{}/lol-summoner/v1/current-summoner", self.base_url);
        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("LCU request failed: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("LCU returned status {}", resp.status()));
        }

        let val: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse summoner JSON: {}", e))?;
        Ok(val)
    }
}
