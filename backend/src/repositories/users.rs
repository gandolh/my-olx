use crate::{
    dto::user::{ListingStats, MessagingStats, MyStatsResponse},
    error::AppError,
};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, AppError>;
    async fn create(&self, email: &str, password_hash: &str) -> Result<User, AppError>;
    async fn set_email_verified(&self, id: Uuid) -> Result<(), AppError>;
    async fn update_password_hash(&self, id: Uuid, password_hash: &str) -> Result<(), AppError>;
    async fn set_phone_verified(&self, id: Uuid, phone: &str) -> Result<(), AppError>;
    async fn get_stats(&self, id: Uuid) -> Result<MyStatsResponse, AppError>;
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

    async fn get_stats(&self, id: Uuid) -> Result<MyStatsResponse, AppError> {
        let stats = sqlx::query!(
            r#"
            WITH me AS (SELECT $1::uuid AS id)
            SELECT
                (SELECT COUNT(*) FROM listings WHERE user_id = me.id AND active = TRUE AND expires_at > NOW()) AS active,
                (SELECT COUNT(*) FROM listings WHERE user_id = me.id AND active = FALSE) AS inactive,
                (SELECT COUNT(*) FROM listings WHERE user_id = me.id AND expires_at <= NOW()) AS expired,
                (SELECT COUNT(*) FROM listings WHERE user_id = me.id AND active = TRUE AND expires_at > NOW() AND expires_at < NOW() + INTERVAL '7 days') AS expiring_soon,
                (SELECT COUNT(*) FROM listings WHERE user_id = me.id AND created_at >= NOW() - INTERVAL '7 days') AS weekly_post_count,
                (SELECT MIN(created_at) FROM listings WHERE user_id = me.id AND created_at >= NOW() - INTERVAL '7 days') AS oldest_post_this_week,
                (SELECT COUNT(*) FROM favorites WHERE user_id = me.id) AS favorites_count,
                (SELECT COUNT(*) FROM messages m JOIN conversations c ON c.id = m.conversation_id WHERE (c.buyer_id = me.id OR c.seller_id = me.id) AND m.sender_id != me.id AND m.read_at IS NULL) AS unread_count,
                (SELECT COUNT(*) FROM conversations WHERE buyer_id = me.id OR seller_id = me.id) AS conversation_count
            FROM me
            "#,
            id
        )
        .fetch_one(&self.pool)
        .await?;

        let week_resets_at = stats.oldest_post_this_week
            .map(|t| t + chrono::Duration::days(7))
            .unwrap_or_else(|| Utc::now());

        Ok(MyStatsResponse {
            listings: ListingStats {
                active: stats.active.unwrap_or(0),
                inactive: stats.inactive.unwrap_or(0),
                expired: stats.expired.unwrap_or(0),
                expiring_soon: stats.expiring_soon.unwrap_or(0),
                weekly_post_count: stats.weekly_post_count.unwrap_or(0),
                weekly_post_limit: 5,
                week_resets_at,
            },
            messages: MessagingStats {
                unread_count: stats.unread_count.unwrap_or(0),
                conversation_count: stats.conversation_count.unwrap_or(0),
            },
            favorites_count: stats.favorites_count.unwrap_or(0),
        })
    }
}
