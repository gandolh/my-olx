# OpenAPI Documentation with Swagger

**Decision:** Use `utoipa` and `utoipa-swagger-ui` to generate and serve interactive API documentation for the Axum backend.

**Why:** Rust's type system is excellent for documenting APIs. `utoipa` provides a macro-driven approach that extracts metadata directly from Rust structs and handlers, ensuring the documentation stays in sync with the code. It is the current industry standard for Axum.

**Trade-offs:** 
- Adds compilation time due to macro heavy lifting.
- Requires manual annotation of handlers (`#[utoipa::path]`) and DTOs (`#[derive(ToSchema)]`).

**Context:** As the API grows, manual testing with `curl` or Postman becomes tedious. Swagger provides a built-in UI for exploration and testing, and generates a standard `openapi.json` that can be used for frontend client generation or integration testing.

## Implementation Steps

1. **Add Dependencies:**
   - `utoipa` (with `axum` feature)
   - `utoipa-swagger-ui`

2. **Annotate DTOs:**
   - Add `#[derive(utoipa::ToSchema)]` to all response and request structs in `backend/src/dto/`.

3. **Annotate Handlers:**
   - Add `#[utoipa::path(...)]` to handler functions in `backend/src/handlers/`.

4. **Define OpenAPI Spec:**
   - Create a central `ApiDoc` struct in `backend/src/routes/openapi.rs` (or similar).

5. **Expose UI:**
   - Mount `SwaggerUi` in `backend/src/router.rs`.
