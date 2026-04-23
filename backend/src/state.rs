use std::sync::Arc;
use sqlx::PgPool;
use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub redis: redis::Client,
    pub s3: aws_sdk_s3::Client,
    pub config: Arc<Config>,
}
