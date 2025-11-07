use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub api_access_token: String,
    pub server_host: String,
    pub server_port: u16,
    pub use_test_data: bool,
    pub custom_mail_servers: HashMap<String, MailServerConfig>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct MailServerConfig {
    pub imap_host: String,
    pub imap_port: u16,
    pub imap_tls: bool,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_secure: bool,
}

impl Config {
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        dotenvy::dotenv().ok();
        Ok(Self {
            database_url: std::env::var("DATABASE_URL")?,
            jwt_secret: std::env::var("JWT_SECRET")?,
            api_access_token: std::env::var("API_ACCESS_TOKEN")?,
            server_host: std::env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            server_port: std::env::var("SERVER_PORT")
                .unwrap_or_else(|_| "3000".to_string())
                .parse()?,
            use_test_data: std::env::var("USE_TEST_DATA")
                .unwrap_or_else(|_| "true".to_string())
                .parse()
                .unwrap_or(true),
            custom_mail_servers: Self::load_custom_mail_servers()?,
        })
    }

    fn load_custom_mail_servers() -> Result<HashMap<String, MailServerConfig>, Box<dyn std::error::Error>> {
        let mut servers = HashMap::new();

        // Load default custom server if configured
        if let (Ok(imap_host), Ok(imap_port), Ok(imap_tls), Ok(smtp_host), Ok(smtp_port), Ok(smtp_secure)) = (
            std::env::var("DEFAULT_IMAP_HOST"),
            std::env::var("DEFAULT_IMAP_PORT"),
            std::env::var("DEFAULT_IMAP_TLS"),
            std::env::var("DEFAULT_SMTP_HOST"),
            std::env::var("DEFAULT_SMTP_PORT"),
            std::env::var("DEFAULT_SMTP_SECURE"),
        ) {
            servers.insert("default".to_string(), MailServerConfig {
                imap_host,
                imap_port: imap_port.parse()?,
                imap_tls: imap_tls.parse()?,
                smtp_host,
                smtp_port: smtp_port.parse()?,
                smtp_secure: smtp_secure.parse()?,
            });
        }

        // Load domain-specific servers
        // Look for environment variables like EXAMPLE_COM_IMAP_HOST, EXAMPLE_COM_SMTP_HOST, etc.
        for (key, value) in std::env::vars() {
            if key.ends_with("_IMAP_HOST") {
                let domain = key.replace("_IMAP_HOST", "").to_lowercase();
                let domain = domain.replace('_', ".");
                
                if let (Ok(imap_port), Ok(imap_tls), Ok(smtp_host), Ok(smtp_port), Ok(smtp_secure)) = (
                    std::env::var(format!("{}_IMAP_PORT", key.replace("_IMAP_HOST", ""))),
                    std::env::var(format!("{}_IMAP_TLS", key.replace("_IMAP_HOST", ""))),
                    std::env::var(format!("{}_SMTP_HOST", key.replace("_IMAP_HOST", ""))),
                    std::env::var(format!("{}_SMTP_PORT", key.replace("_IMAP_HOST", ""))),
                    std::env::var(format!("{}_SMTP_SECURE", key.replace("_IMAP_HOST", ""))),
                ) {
                    servers.insert(domain, MailServerConfig {
                        imap_host: value,
                        imap_port: imap_port.parse()?,
                        imap_tls: imap_tls.parse()?,
                        smtp_host,
                        smtp_port: smtp_port.parse()?,
                        smtp_secure: smtp_secure.parse()?,
                    });
                }
            }
        }

        Ok(servers)
    }
}