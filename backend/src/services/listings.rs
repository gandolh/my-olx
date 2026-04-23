use std::sync::Arc;
use chrono::Utc;
use uuid::Uuid;
use crate::{
    config::Config,
    dto::listing::{
        CreateListingRequest, ListingCardResponse, ListingDetailResponse, ListingFilters,
        ListingImageResponse, ListingResponse, ListingsPageResponse, SellerSummary,
    },
    error::AppError,
    models::listing::Listing,
    repositories::listings::{ListingCardRow, ListingImageRow, ListingRepository},
    repositories::users::UserRepository,
};

const WEEKLY_POST_LIMIT: i64 = 5;

pub struct ListingService<R: ListingRepository, U: UserRepository> {
    pub repo: Arc<R>,
    pub user_repo: Arc<U>,
    pub config: Arc<Config>,
}

impl<R: ListingRepository, U: UserRepository> ListingService<R, U> {
    pub fn new(repo: Arc<R>, user_repo: Arc<U>, config: Arc<Config>) -> Self {
        Self { repo, user_repo, config }
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

    pub async fn search(&self, filters: &ListingFilters) -> Result<ListingsPageResponse, AppError> {
        let (rows, total_count) = self.repo.search(filters).await?;
        let per_page = filters.per_page();
        let total_pages = if total_count == 0 { 0 } else { (total_count + per_page - 1) / per_page };

        Ok(ListingsPageResponse {
            listings: rows.into_iter().map(|row| card_row_to_response(row, &self.config)).collect(),
            total_count,
            total_pages,
            page: filters.page(),
        })
    }

    pub async fn featured(&self, limit: i64) -> Result<Vec<ListingCardResponse>, AppError> {
        let rows = self.repo.featured(limit).await?;
        Ok(rows.into_iter().map(|row| card_row_to_response(row, &self.config)).collect())
    }

    pub async fn get_detail(&self, id: Uuid, viewer_id: Option<Uuid>) -> Result<ListingDetailResponse, AppError> {
        let row = self.repo.find_detail(id).await?
            .ok_or(AppError::NotFound)?;

        if (!row.active || row.expires_at <= Utc::now()) && viewer_id != Some(row.user_id) {
            return Err(AppError::NotFound);
        }

        self.repo.increment_view_count(id).await?;
        let images = self.repo.list_images(id).await?;

        Ok(ListingDetailResponse {
            id: row.id,
            title: row.title,
            description: row.description,
            price_ron: row.price_ron,
            is_negotiable: row.is_negotiable,
            category: row.category.clone(),
            category_label: category_label(&row.category).to_string(),
            city: row.city,
            images: images.into_iter().map(|image| image_row_to_response(image, &self.config)).collect(),
            view_count: row.view_count + 1,
            posted_at: row.created_at,
            expires_at: row.expires_at,
            active: row.active,
            seller: SellerSummary {
                id: row.seller_id,
                display_name: row.seller_display_name,
                avatar_url: row.seller_avatar_url,
                phone_verified: row.seller_phone_verified,
                member_since: row.seller_member_since,
                active_listings_count: row.seller_active_listings_count,
            },
        })
    }

    pub async fn get_related(&self, id: Uuid) -> Result<Vec<ListingCardResponse>, AppError> {
        let detail = self.repo.find_detail(id).await?
            .ok_or(AppError::NotFound)?;
        let rows = self.repo.list_related(&detail.category, id, 4).await?;
        Ok(rows.into_iter().map(|row| card_row_to_response(row, &self.config)).collect())
    }

    pub async fn delete(&self, id: Uuid, owner_id: Uuid) -> Result<(), AppError> {
        self.repo.delete(id, owner_id).await
    }
}

pub fn category_label(slug: &str) -> &'static str {
    match slug {
        "electronice" => "Electronice",
        "auto" => "Auto, moto și ambarcațiuni",
        "imobiliare" => "Imobiliare",
        "casa-gradina" => "Casă și grădină",
        "moda" => "Modă și frumusețe",
        "joburi" => "Locuri de muncă",
        "servicii" => "Servicii, afaceri",
        "sport" => "Sport și timp liber",
        "gratuit" => "Oferite gratuit",
        _ => "Diverse",
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

fn card_row_to_response(row: ListingCardRow, config: &Config) -> ListingCardResponse {
    ListingCardResponse {
        id: row.id,
        title: row.title,
        price_ron: row.price_ron,
        city: row.city,
        category: row.category,
        cover_url: image_url(row.cover_url, config),
        seller_verified: row.seller_verified,
        posted_at: row.posted_at,
        active: row.active,
        expires_at: row.expires_at,
    }
}

fn image_row_to_response(row: ListingImageRow, config: &Config) -> ListingImageResponse {
    ListingImageResponse {
        id: row.id,
        url: image_url(Some(row.s3_key), config).unwrap_or_default(),
        position: row.position,
    }
}

fn image_url(value: Option<String>, config: &Config) -> Option<String> {
    value.map(|raw| {
        if raw.starts_with("http://") || raw.starts_with("https://") {
            raw
        } else {
            format!(
                "https://{}.s3.{}.amazonaws.com/{}",
                config.aws_s3_bucket,
                config.aws_region,
                raw.trim_start_matches('/')
            )
        }
    })
}
