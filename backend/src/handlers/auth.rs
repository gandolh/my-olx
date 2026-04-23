use axum::{extract::State, Json};
use std::sync::Arc;
use validator::Validate;
use crate::{
    dto::auth::{AuthResponse, LoginRequest, RegisterRequest},
    error::AppError,
    repositories::users::PgUserRepository,
    services::auth::AuthService,
    state::AppState,
};

pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let repo = Arc::new(PgUserRepository { pool: state.db.clone() });
    let svc = AuthService::new(repo, state.config.jwt_secret.clone(), state.config.jwt_expiry_seconds);
    let resp = svc.register(&body.email, &body.password).await?;
    Ok(Json(resp))
}

pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    body.validate().map_err(|e| AppError::Validation(e.to_string()))?;
    let repo = Arc::new(PgUserRepository { pool: state.db.clone() });
    let svc = AuthService::new(repo, state.config.jwt_secret.clone(), state.config.jwt_expiry_seconds);
    let resp = svc.login(&body.email, &body.password).await?;
    Ok(Json(resp))
}
