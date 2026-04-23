use std::sync::Arc;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::{dto::auth::AuthResponse, error::AppError, repositories::users::UserRepository};

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

pub struct AuthService<R: UserRepository> {
    pub user_repo: Arc<R>,
    pub jwt_secret: String,
    pub jwt_expiry_seconds: u64,
}

impl<R: UserRepository> AuthService<R> {
    pub fn new(user_repo: Arc<R>, jwt_secret: String, jwt_expiry_seconds: u64) -> Self {
        Self { user_repo, jwt_secret, jwt_expiry_seconds }
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
        let token = self.make_token(user.id)?;
        Ok(AuthResponse { token, user_id: user.id.to_string() })
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
        Ok(AuthResponse { token, user_id: user.id.to_string() })
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
                phone: None,
                phone_verified: false,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            })
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
