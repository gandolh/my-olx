use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub database_url: String,
    pub redis_url: String,
    pub jwt_secret: String,
    pub jwt_expiry_seconds: u64,
    pub aws_region: String,
    pub aws_s3_bucket: String,
    pub host: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Result<Self, config::ConfigError> {
        dotenvy::dotenv().ok();
        config::Config::builder()
            .add_source(config::Environment::default())
            .set_default("host", "0.0.0.0")?
            .set_default("port", 8080)?
            .set_default("jwt_expiry_seconds", 86400)?
            .build()?
            .try_deserialize()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn config_has_required_fields() {
        let cfg = Config {
            database_url: "postgres://localhost/test".into(),
            redis_url: "redis://localhost".into(),
            jwt_secret: "secret".into(),
            jwt_expiry_seconds: 3600,
            aws_region: "eu-central-1".into(),
            aws_s3_bucket: "bucket".into(),
            host: "0.0.0.0".into(),
            port: 8080,
        };
        assert_eq!(cfg.port, 8080);
        assert_eq!(cfg.jwt_expiry_seconds, 3600);
    }
}
