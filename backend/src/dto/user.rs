use serde::Serialize;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize)]
pub struct MyStatsResponse {
    pub listings: ListingStats,
    pub messages: MessagingStats,
    pub favorites_count: i64,
}

#[derive(Debug, Serialize)]
pub struct ListingStats {
    pub active: i64,
    pub inactive: i64,
    pub expired: i64,
    pub expiring_soon: i64,
    pub weekly_post_count: i64,
    pub weekly_post_limit: i64,
    pub week_resets_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct MessagingStats {
    pub unread_count: i64,
    pub conversation_count: i64,
}
