use crate::{
    dto::auth::UserSummary,
    error::AppError,
    middleware::auth::AuthUser,
    repositories::{
        email_tokens::EmailTokenRepository, password_tokens::PasswordTokenRepository,
        users::PgUserRepository,
    },
    services::auth::AuthService,
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
    let email_token_repo = EmailTokenRepository::new(state.db.clone());
    let password_token_repo = PasswordTokenRepository::new(state.db.clone());
    let svc = AuthService::new(
        repo,
        email_token_repo,
        password_token_repo,
        state.email.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expiry_seconds,
    );
    let user_summary = svc.get_user_summary(user_id).await?;
    Ok(Json(user_summary))
}
