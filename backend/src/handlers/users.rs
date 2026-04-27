use crate::{
    dto::{auth::UserSummary, user::MyStatsResponse},
    error::AppError,
    middleware::auth::AuthUser,
    repositories::{
        email_tokens::PgEmailTokenRepository, password_tokens::PgPasswordTokenRepository,
        phone_tokens::PgPhoneTokenRepository, users::PgUserRepository,
    },
    services::{auth::AuthService, users::UserService},
    state::AppState,
};
use axum::{extract::State, Json};
use std::sync::Arc;

pub async fn me(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> Result<Json<UserSummary>, AppError> {
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let email_token_repo = Arc::new(PgEmailTokenRepository::new(state.db.clone()));
    let password_token_repo = Arc::new(PgPasswordTokenRepository::new(state.db.clone()));
    let svc = AuthService::new(
        repo,
        email_token_repo,
        password_token_repo,
        Arc::new(PgPhoneTokenRepository::new(state.db.clone())),
        state.email.clone(),
        state.phone.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expiry_seconds,
    );
    let user_summary = svc.get_user_summary(user_id).await?;
    Ok(Json(user_summary))
}

pub async fn get_stats(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> Result<Json<MyStatsResponse>, AppError> {
    let repo = Arc::new(PgUserRepository {
        pool: state.db.clone(),
    });
    let svc = UserService::new(repo);
    let stats = svc.get_stats(user_id).await?;
    Ok(Json(stats))
}
