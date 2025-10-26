use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Clone)]
pub struct ApiClient {
    client: Client,
    base_url: String,
    access_token: String,
}

impl ApiClient {
    pub fn new(base_url: String, access_token: String) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            client,
            base_url,
            access_token,
        }
    }

    pub async fn get<T: for<'de> Deserialize<'de>>(&self, endpoint: &str) -> Result<T, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}{}", self.base_url, endpoint);
        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.access_token))
            .header("Content-Type", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("API request failed with status: {}", response.status()).into());
        }

        let data = response.json::<T>().await?;
        Ok(data)
    }

    pub async fn post<T: Serialize, R: for<'de> Deserialize<'de>>(&self, endpoint: &str, body: &T) -> Result<R, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}{}", self.base_url, endpoint);
        let response = self.client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.access_token))
            .header("Content-Type", "application/json")
            .json(body)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("API request failed with status: {}", response.status()).into());
        }

        let data = response.json::<R>().await?;
        Ok(data)
    }

    pub async fn put<T: Serialize, R: for<'de> Deserialize<'de>>(&self, endpoint: &str, body: &T) -> Result<R, Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}{}", self.base_url, endpoint);
        let response = self.client
            .put(&url)
            .header("Authorization", format!("Bearer {}", self.access_token))
            .header("Content-Type", "application/json")
            .json(body)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("API request failed with status: {}", response.status()).into());
        }

        let data = response.json::<R>().await?;
        Ok(data)
    }

    pub async fn delete(&self, endpoint: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}{}", self.base_url, endpoint);
        let response = self.client
            .delete(&url)
            .header("Authorization", format!("Bearer {}", self.access_token))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("API request failed with status: {}", response.status()).into());
        }

        Ok(())
    }
}