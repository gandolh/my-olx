use std::sync::Arc;
use base64::Engine;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;
use rand::Rng;
use crate::{
    dto::auth::{AuthResponse, UserSummary},
    error::AppError,
    repositories::{
        users::UserRepository,
        email_tokens::EmailTokenRepository,
        password_tokens::PasswordTokenRepository,
    },
    services::email::EmailService,
};

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

pub struct AuthService<R: UserRepository> {
    pub user_repo: Arc<R>,
    pub email_token_repo: EmailTokenRepository,
    pub password_token_repo: PasswordTokenRepository,
    pub email_service: Arc<dyn EmailService>,
    pub jwt_secret: String,
    pub jwt_expiry_seconds: u64,
}

impl<R: UserRepository> AuthService<R> {
    pub fn new(
        user_repo: Arc<R>,
        email_token_repo: EmailTokenRepository,
        password_token_repo: PasswordTokenRepository,
        email_service: Arc<dyn EmailService>,
        jwt_secret: String,
        jwt_expiry_seconds: u64,
    ) -> Self {
        Self {
            user_repo,
            email_token_repo,
            password_token_repo,
            email_service,
            jwt_secret,
            jwt_expiry_seconds,
        }
    }

    pub async fn register(&self, email: &str, password: &str) -> Result<AuthResponse, AppError> {
        if self.user_repo.find_by_email(email).await?.is_some() {
            return Err(AppError::Conflict("email already registered".into()));
        }
        let salt = SaltString::generate(&mut OsRng);
        let hash = Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("hash error: {}", e)))?
            .to_string();
        let user = self.user_repo.create(email, &hash).await?;
        
        let verify_token = self.generate_token();
        self.email_token_repo.create(user.id, &verify_token, 24).await?;
        self.email_service.send_verification_email(&user.email, &verify_token).await?;
        
        let token = self.make_token(user.id)?;
        let user_summary = self.user_to_summary(&user);
        Ok(AuthResponse { token, user: user_summary })
    }

    pub async fn login(&self, email: &str, password: &str) -> Result<AuthResponse, AppError> {
        let user = self.user_repo.find_by_email(email).await?
            .ok_or(AppError::Unauthorized)?;
        let parsed = PasswordHash::new(&user.password_hash)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("hash parse error: {}", e)))?;
        Argon2::default()
            .verify_password(password.as_bytes(), &parsed)
            .map_err(|_| AppError::Unauthorized)?;
        let token = self.make_token(user.id)?;
        let user_summary = self.user_to_summary(&user);
        Ok(AuthResponse { token, user: user_summary })
    }

    pub async fn verify_email(&self, token: &str) -> Result<(), AppError> {
        let email_token = self.email_token_repo.find_by_token(token).await?
            .ok_or(AppError::NotFound)?;
        
        if email_token.used_at.is_some() {
            return Err(AppError::Validation("Token already used".into()));
        }
        
        if email_token.expires_at < Utc::now() {
            return Err(AppError::Validation("Token expired".into()));
        }
        
        self.user_repo.set_email_verified(email_token.user_id).await?;
        self.email_token_repo.mark_used(token).await?;
        
        Ok(())
    }

    pub async fn resend_verification(&self, user_id: Uuid) -> Result<(), AppError> {
        let user = self.user_repo.find_by_id(user_id).await?
            .ok_or(AppError::NotFound)?;
        
        if user.email_verified {
            return Err(AppError::Validation("Email already verified".into()));
        }
        
        self.email_token_repo.delete_for_user(user_id).await?;
        
        let verify_token = self.generate_token();
        self.email_token_repo.create(user_id, &verify_token, 24).await?;
        self.email_service.send_verification_email(&user.email, &verify_token).await?;
        
        Ok(())
    }

    pub async fn forgot_password(&self, email: &str) -> Result<(), AppError> {
        if let Some(user) = self.user_repo.find_by_email(email).await? {
            self.password_token_repo.delete_for_user(user.id).await?;
            
            let reset_token = self.generate_token();
            self.password_token_repo.create(user.id, &reset_token, 1).await?;
            self.email_service.send_password_reset_email(&user.email, &reset_token).await?;
        }
        
        Ok(())
    }

    pub async fn reset_password(&self, token: &str, new_password: &str) -> Result<(), AppError> {
        let password_token = self.password_token_repo.find_by_token(token).await?
            .ok_or(AppError::NotFound)?;
        
        if password_token.used_at.is_some() {
            return Err(AppError::Validation("Token already used".into()));
        }
        
        if password_token.expires_at < Utc::now() {
            return Err(AppError::Validation("Token expired".into()));
        }
        
        let salt = SaltString::generate(&mut OsRng);
        let hash = Argon2::default()
            .hash_password(new_password.as_bytes(), &salt)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("hash error: {}", e)))?
            .to_string();
        
        self.user_repo.update_password_hash(password_token.user_id, &hash).await?;
        self.password_token_repo.mark_used(token).await?;
        
        Ok(())
    }

    pub async fn get_user_summary(&self, user_id: Uuid) -> Result<UserSummary, AppError> {
        let user = self.user_repo.find_by_id(user_id).await?
            .ok_or(AppError::NotFound)?;
        Ok(self.user_to_summary(&user))
    }

    fn user_to_summary(&self, user: &crate::models::user::User) -> UserSummary {
        UserSummary {
            id: user.id,
            email: user.email.clone(),
            display_name: None,
            email_verified: user.email_verified,
            phone_verified: user.phone_verified,
        }
    }

    fn generate_token(&self) -> String {
        let bytes: [u8; 32] = rand::thread_rng().gen();
        base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(bytes)
    }

    fn make_token(&self, user_id: Uuid) -> Result<String, AppError> {
        let exp = (chrono::Utc::now().timestamp() as u64 + self.jwt_expiry_seconds) as usize;
        let claims = Claims { sub: user_id.to_string(), exp };
        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        )
        .map_err(|e| AppError::Internal(anyhow::anyhow!("jwt error: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{models::user::User, error::AppError};
    use async_trait::async_trait;
    use uuid::Uuid;
    use chrono::Utc;

    struct MockUserRepo {
        user: Option<User>,
    }

    #[async_trait]
    impl crate::repositories::users::UserRepository for MockUserRepo {
        async fn find_by_email(&self, _email: &str) -> Result<Option<User>, AppError> {
            Ok(self.user.clone())
        }
        async fn find_by_id(&self, _id: Uuid) -> Result<Option<User>, AppError> {
            Ok(self.user.clone())
        }
        async fn create(&self, email: &str, password_hash: &str) -> Result<User, AppError> {
            Ok(User {
                id: Uuid::new_v4(),
                email: email.to_string(),
                password_hash: password_hash.to_string(),
                display_name: None,
                email_verified: false,
                phone: None,
                phone_verified: false,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            })
        }
        async fn set_email_verified(&self, _id: Uuid) -> Result<(), AppError> {
            Ok(())
        }
        async fn update_password_hash(&self, _id: Uuid, _password_hash: &str) -> Result<(), AppError> {
            Ok(())
        }
    }

    fn make_service(user: Option<User>) -> AuthService<MockUserRepo> {
        AuthService {
            user_repo: Arc::new(MockUserRepo { user }),
            jwt_secret: "test-secret".to_string(),
            jwt_expiry_seconds: 3600,
        }
    }

    #[tokio::test]
    async fn register_returns_token_for_new_user() {
        let svc = make_service(None);
        let result = svc.register("user@example.com", "password123").await;
        assert!(result.is_ok());
        let resp = result.unwrap();
        assert!(!resp.token.is_empty());
    }

    #[tokio::test]
    async fn register_fails_if_email_taken() {
        let existing = User {
            id: Uuid::new_v4(),
            email: "user@example.com".into(),
            password_hash: "hash".into(),
            display_name: None,
            email_verified: false,
            phone: None,
            phone_verified: false,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let svc = make_service(Some(existing));
        let result = svc.register("user@example.com", "password123").await;
        assert!(matches!(result, Err(AppError::Conflict(_))));
    }

    #[tokio::test]
    async fn login_fails_with_wrong_password() {
        let salt = SaltString::generate(&mut OsRng);
        let hash = Argon2::default()
            .hash_password(b"correct-password", &salt)
            .unwrap()
            .to_string();
        let existing = User {
            id: Uuid::new_v4(),
            email: "user@example.com".into(),
            password_hash: hash,
            display_name: None,
            email_verified: false,
            phone: None,
            phone_verified: false,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let svc = make_service(Some(existing));
        let result = svc.login("user@example.com", "wrong-password").await;
        assert!(matches!(result, Err(AppError::Unauthorized)));
    }
}
