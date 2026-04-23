mod config;
mod dto;
mod error;
mod handlers;
mod middleware;
mod models;
mod repositories;
mod router;
mod routes;
mod services;
mod state;

use std::sync::Arc;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "my_olx_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cfg = config::Config::from_env()?;
    let db = sqlx::PgPool::connect(&cfg.database_url).await?;
    let redis = redis::Client::open(cfg.redis_url.clone())?;
    let aws_cfg = aws_config::from_env()
        .region(aws_config::meta::region::RegionProviderChain::default_provider())
        .load()
        .await;
    let s3 = aws_sdk_s3::Client::new(&aws_cfg);

    let state = state::AppState {
        db,
        redis,
        s3,
        config: Arc::new(cfg.clone()),
    };

    let app = router::build(state);
    let addr = format!("{}:{}", cfg.host, cfg.port);
    tracing::info!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
