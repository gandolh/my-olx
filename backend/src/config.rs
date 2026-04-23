use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub database_url: String,
    pub redis_url: String,
    pub jwt_secret: String,
    pub jwt_expiry_seconds: u64,
    pub aws_region: String,
    #[allow(dead_code)]
    pub aws_s3_bucket: String,
    pub s3_public_base_url: String,
    pub host: String,
    pub port: u16,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_username: String,
    pub smtp_password: String,
    pub smtp_from: String,
    pub frontend_base_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self, config::ConfigError> {
        dotenvy::dotenv().ok();
        config::Config::builder()
            .add_source(config::Environment::default())
            .set_default("host", "0.0.0.0")?
            .set_default("port", 8080)?
            .set_default("jwt_expiry_seconds", 86400)?
            .set_default("smtp_host", "localhost")?
            .set_default("smtp_port", 1025)?
            .set_default("smtp_username", "")?
            .set_default("smtp_password", "")?
            .set_default("smtp_from", "noreply@piataro.ro")?
            .set_default("frontend_base_url", "http://localhost:5173")?
            .set_default("s3_public_base_url", "http://localhost:4566/my-olx-uploads")?
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
            s3_public_base_url: "http://localhost:4566/bucket".into(),
            host: "0.0.0.0".into(),
            port: 8080,
            smtp_host: "localhost".into(),
            smtp_port: 1025,
            smtp_username: "user".into(),
            smtp_password: "pass".into(),
            smtp_from: "noreply@piataro.ro".into(),
            frontend_base_url: "http://localhost:5173".into(),
        };
        assert_eq!(cfg.port, 8080);
        assert_eq!(cfg.jwt_expiry_seconds, 3600);
    }
}
