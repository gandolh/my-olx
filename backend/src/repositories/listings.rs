use async_trait::async_trait;
use uuid::Uuid;
use crate::{dto::listing::CreateListingRequest, error::AppError, models::listing::Listing};

#[async_trait]
pub trait ListingRepository: Send + Sync {
    async fn create(&self, user_id: Uuid, data: &CreateListingRequest) -> Result<Listing, AppError>;
    async fn list_by_user(&self, user_id: Uuid) -> Result<Vec<Listing>, AppError>;
    async fn delete(&self, id: Uuid, owner_id: Uuid) -> Result<(), AppError>;
    async fn count_this_week(&self, user_id: Uuid) -> Result<i64, AppError>;
}

pub struct PgListingRepository {
    pub pool: sqlx::PgPool,
}

#[async_trait]
impl ListingRepository for PgListingRepository {
    async fn create(&self, user_id: Uuid, data: &CreateListingRequest) -> Result<Listing, AppError> {
        let listing = sqlx::query_as::<_, Listing>(
            r#"
            INSERT INTO listings (id, user_id, title, description, price_ron, is_negotiable, category, city, active, expires_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW() + INTERVAL '30 days', NOW(), NOW())
            RETURNING *
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(user_id)
        .bind(&data.title)
        .bind(&data.description)
        .bind(data.price_ron)
        .bind(data.is_negotiable)
        .bind(&data.category)
        .bind(&data.city)
        .fetch_one(&self.pool)
        .await?;
        Ok(listing)
    }

    async fn list_by_user(&self, user_id: Uuid) -> Result<Vec<Listing>, AppError> {
        let listings = sqlx::query_as::<_, Listing>(
            "SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC",
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?;
        Ok(listings)
    }

    async fn delete(&self, id: Uuid, owner_id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM listings WHERE id = $1 AND user_id = $2")
            .bind(id)
            .bind(owner_id)
            .execute(&self.pool)
            .await?;
        if result.rows_affected() == 0 {
            return Err(AppError::NotFound);
        }
        Ok(())
    }

    async fn count_this_week(&self, user_id: Uuid) -> Result<i64, AppError> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM listings WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'",
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(row.0)
    }
}
