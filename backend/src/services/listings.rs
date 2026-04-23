use std::sync::Arc;
use uuid::Uuid;
use crate::{
    dto::listing::{CreateListingRequest, ListingResponse},
    error::AppError,
    models::listing::Listing,
    repositories::{listings::ListingRepository, users::UserRepository},
};

const WEEKLY_POST_LIMIT: i64 = 5;

pub struct ListingService<R: ListingRepository, U: UserRepository> {
    pub repo: Arc<R>,
    pub user_repo: Arc<U>,
}

impl<R: ListingRepository, U: UserRepository> ListingService<R, U> {
    pub fn new(repo: Arc<R>, user_repo: Arc<U>) -> Self {
        Self { repo, user_repo }
    }

    pub async fn create(&self, user_id: Uuid, data: &CreateListingRequest) -> Result<ListingResponse, AppError> {
        let user = self.user_repo.find_by_id(user_id).await?
            .ok_or(AppError::NotFound)?;
        
        if !user.email_verified {
            return Err(AppError::Forbidden);
        }
        
        let count = self.repo.count_this_week(user_id).await?;
        if count >= WEEKLY_POST_LIMIT {
            return Err(AppError::RateLimit);
        }
        let listing = self.repo.create(user_id, data).await?;
        Ok(listing_to_response(listing))
    }

    pub async fn list_by_user(&self, user_id: Uuid) -> Result<Vec<ListingResponse>, AppError> {
        let listings = self.repo.list_by_user(user_id).await?;
        Ok(listings.into_iter().map(listing_to_response).collect())
    }

    pub async fn delete(&self, id: Uuid, owner_id: Uuid) -> Result<(), AppError> {
        self.repo.delete(id, owner_id).await
    }
}

fn listing_to_response(l: Listing) -> ListingResponse {
    ListingResponse {
        id: l.id,
        user_id: l.user_id,
        title: l.title,
        description: l.description,
        price_ron: l.price_ron,
        is_negotiable: l.is_negotiable,
        category: l.category,
        city: l.city,
        active: l.active,
        expires_at: l.expires_at,
        created_at: l.created_at,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{dto::listing::CreateListingRequest, error::AppError, models::listing::Listing};
    use async_trait::async_trait;
    use uuid::Uuid;
    use chrono::Utc;

    struct MockListingRepo {
        weekly_count: i64,
    }

    fn make_listing(user_id: Uuid) -> Listing {
        Listing {
            id: Uuid::new_v4(),
            user_id,
            title: "Test listing".into(),
            description: "A description".into(),
            price_ron: Some(100),
            is_negotiable: false,
            category: "electronics".into(),
            city: "Bucharest".into(),
            active: true,
            expires_at: Utc::now() + chrono::Duration::days(30),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    #[async_trait]
    impl crate::repositories::listings::ListingRepository for MockListingRepo {
        async fn create(&self, user_id: Uuid, _data: &CreateListingRequest) -> Result<Listing, AppError> {
            Ok(make_listing(user_id))
        }
        async fn list_by_user(&self, user_id: Uuid) -> Result<Vec<Listing>, AppError> {
            Ok(vec![make_listing(user_id)])
        }
        async fn delete(&self, _id: Uuid, _owner_id: Uuid) -> Result<(), AppError> {
            Ok(())
        }
        async fn count_this_week(&self, _user_id: Uuid) -> Result<i64, AppError> {
            Ok(self.weekly_count)
        }
    }

    fn make_request() -> CreateListingRequest {
        CreateListingRequest {
            title: "My phone".into(),
            description: "Great condition phone".into(),
            price_ron: Some(500),
            is_negotiable: true,
            category: "electronics".into(),
            city: "Cluj".into(),
        }
    }

    #[tokio::test]
    async fn create_listing_succeeds_under_weekly_limit() {
        let svc = ListingService { repo: Arc::new(MockListingRepo { weekly_count: 3 }) };
        let result = svc.create(Uuid::new_v4(), &make_request()).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn create_listing_fails_at_weekly_limit() {
        let svc = ListingService { repo: Arc::new(MockListingRepo { weekly_count: 5 }) };
        let result = svc.create(Uuid::new_v4(), &make_request()).await;
        assert!(matches!(result, Err(AppError::RateLimit)));
    }

    #[tokio::test]
    async fn list_by_user_returns_listings() {
        let svc = ListingService { repo: Arc::new(MockListingRepo { weekly_count: 0 }) };
        let result = svc.list_by_user(Uuid::new_v4()).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 1);
    }
}
