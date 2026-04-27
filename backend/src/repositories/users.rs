use crate::{error::AppError, models::user::User};
use async_trait::async_trait;
use uuid::Uuid;

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, AppError>;
    async fn create(&self, email: &str, password_hash: &str) -> Result<User, AppError>;
    async fn set_email_verified(&self, id: Uuid) -> Result<(), AppError>;
    async fn update_password_hash(&self, id: Uuid, password_hash: &str) -> Result<(), AppError>;
    async fn set_phone_verified(&self, id: Uuid, phone: &str) -> Result<(), AppError>;
}

pub struct PgUserRepository {
    pub pool: sqlx::PgPool,
}

#[async_trait]
impl UserRepository for PgUserRepository {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError> {
        let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_optional(&self.pool)
            .await?;
        Ok(user)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, AppError> {
        let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(user)
    }

    async fn create(&self, email: &str, password_hash: &str) -> Result<User, AppError> {
        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING *
            "#,
        )
        .bind(email)
        .bind(password_hash)
        .fetch_one(&self.pool)
        .await?;
        Ok(user)
    }

    async fn set_email_verified(&self, id: Uuid) -> Result<(), AppError> {
        sqlx::query("UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn update_password_hash(&self, id: Uuid, password_hash: &str) -> Result<(), AppError> {
        sqlx::query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2")
            .bind(password_hash)
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn set_phone_verified(&self, id: Uuid, phone: &str) -> Result<(), AppError> {
        sqlx::query("UPDATE users SET phone = $1, phone_verified = true, updated_at = NOW() WHERE id = $2")
            .bind(phone)
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
