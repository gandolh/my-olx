use crate::{
    dto::auth::{
        AuthResponse, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest,
        VerifyEmailRequest,
    },
    error::AppError,
    middleware::auth::AuthUser,
    repositories::{
        email_tokens::EmailTokenRepository, password_tokens::PasswordTokenRepository,
        users::PgUserRepository,
    },
    services::auth::AuthService,
    state::AppState,
};
use axum::{extract::State, http::StatusCode, Json};
use std::sync::Arc;
use validator::Validate;

pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
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
    let resp = svc.register(&body.email, &body.password).await?;
    Ok(Json(resp))
}

pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
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
    let resp = svc.login(&body.email, &body.password).await?;
    Ok(Json(resp))
}

pub async fn logout() -> Result<StatusCode, AppError> {
    Ok(StatusCode::NO_CONTENT)
}

pub async fn verify_email(
    State(state): State<AppState>,
    Json(body): Json<VerifyEmailRequest>,
) -> Result<StatusCode, AppError> {
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
    svc.verify_email(&body.token).await?;
    Ok(StatusCode::OK)
}

pub async fn resend_verification(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> Result<StatusCode, AppError> {
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
    svc.resend_verification(user_id).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn forgot_password(
    State(state): State<AppState>,
    Json(body): Json<ForgotPasswordRequest>,
) -> Result<StatusCode, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
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
    svc.forgot_password(&body.email).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn reset_password(
    State(state): State<AppState>,
    Json(body): Json<ResetPasswordRequest>,
) -> Result<StatusCode, AppError> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;
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
    svc.reset_password(&body.token, &body.password).await?;
    Ok(StatusCode::OK)
}
