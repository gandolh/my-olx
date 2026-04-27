# CORS Policy

**Decision:** Implemented an env-gated CORS allowlist.

**Why:** Defaulting to `Any` (wildcard) is unsafe for production. We need to restrict origins to the known frontend domains.

**Trade-offs:** Requires configuration in every environment (Dev/Prod).

**Context:** 
- Dev: `http://localhost:5173`, `http://localhost:3000`
- Prod: `https://piataro.ro`, `https://www.piataro.ro`
- Allowed Methods: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`
- Allowed Headers: `AUTHORIZATION`, `CONTENT_TYPE`, `ACCEPT`
