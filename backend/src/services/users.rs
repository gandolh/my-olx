use crate::{
    dto::user::MyStatsResponse,
    error::AppError,
    repositories::users::UserRepository,
};
use std::sync::Arc;
use uuid::Uuid;

pub struct UserService<U: UserRepository> {
    pub repo: Arc<U>,
}

impl<U: UserRepository> UserService<U> {
    pub fn new(repo: Arc<U>) -> Self {
        Self { repo }
    }

    pub async fn get_stats(&self, user_id: Uuid) -> Result<MyStatsResponse, AppError> {
        self.repo.get_stats(user_id).await
    }
}
