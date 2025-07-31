
# 📍 NEXT DEVELOPMENT PHASE PLAN  
**Project:** Real Estate Map Region Platform  
**Current Status:** Frontend map and backend region API implemented  
**Next Goal:** Frontend–Backend integration with full TDD + Auth

---

## 🎯 OBJECTIVES

| Goal | Description |
|------|-------------|
| 1. Frontend ↔ Backend integration | Enable saving and fetching drawn regions |
| 2. JWT auth integration | Secure all requests via token |
| 3. UI feedback loop | Show success/failure on region operations |
| 4. TDD compliance | Add unit + E2E tests for all new features |

---

## 🧩 DEVELOPMENT TASKS

### 1. **Frontend Auth Integration**
> 📍 _Owner: Frontend Team_

- [ ] Create Login UI (email + password)
- [ ] Call `/api/v1/auth/login` and store JWT securely
- [ ] Add HTTP Interceptor to attach `Authorization` headers
- [ ] Handle token expiration (optional: silent refresh or redirect)

### 2. **Region API Integration**
> 📍 _Owner: Frontend Team_

- [ ] On draw complete → POST to `/api/v1/regions`
- [ ] On app load → GET `/api/v1/regions` and render all shapes
- [ ] Implement loading states and basic error display

**Hint:** Use `RegionService` with Angular `HttpClient`.

### 3. **Filter by Map Bounds**
> 📍 _Owner: Backend & Frontend_

- [ ] Frontend sends current bounds to:
  `GET /api/v1/regions/bounds?minLat=...&minLng=...&maxLat=...&maxLng=...`
- [ ] Backend filters using PostGIS bounding box query
- [ ] Return only regions intersecting with the current map view

### 4. **Role-Based Access (Security Check)**
> 📍 _Owner: Backend Team_

- [ ] Add `@PreAuthorize` or manual user-check in `RegionController`
- [ ] Ensure that a user can only access **their own** regions
- [ ] Optional: enable `admin` to see all

---

## ✅ TEST PLAN (TDD)

### 🔹 Frontend Tests
- [ ] Unit tests for `RegionService`
- [ ] Component tests for draw/save/load
- [ ] Token interceptor test
- [ ] Cypress E2E: Login → Draw → Save → Refresh → Load

### 🔹 Backend Tests
- [ ] Unit tests: `RegionService`, auth guards
- [ ] Integration tests: `RegionController`
- [ ] DB test: PostGIS shape insertion + spatial query filter

---

## 🛠 FILE STRUCTURE SUGGESTION

```bash
frontend/
├── src/app/services/region.service.ts
├── src/app/services/auth.service.ts
├── src/app/components/login/
├── src/app/components/map/
├── app.interceptor.ts
├── tests/
│   └── region.service.spec.ts

backend/
├── src/main/java/com/app/region/controller/RegionController.java
├── src/main/java/com/app/region/service/RegionService.java
├── src/test/java/com/app/region/
│   └── RegionControllerTest.java
│   └── RegionServiceTest.java
```

---

## 🧠 TECH HINTS

| Task | Tech Hint |
|------|-----------|
| PostGIS filter | Use `ST_MakeEnvelope` + `ST_Intersects` |
| Shape format | Use `GeoJSON` (Polygon or MultiPolygon) |
| Angular security | Use route guards + interceptors |
| Auth | Spring Security + JWT filter already in place |

---

## 📅 TIMELINE ESTIMATE

| Phase | Duration |
|-------|----------|
| Auth UI + Interceptor | 1–2 days |
| Region save/load integration | 1–2 days |
| Bounding filter (FE/BE) | 2 days |
| Testing (unit + e2e) | 2–3 days |

---

## 📘 DEVELOPER TODO.md

```md
# 🧭 Developer Guide – Phase 2

## What to Do:
1. Implement frontend JWT login
2. Connect map to backend region API
3. Implement shape filtering via map bounds
4. Respect role-based access
5. Write tests for all of the above (unit + E2E)

## API Reference
- POST /api/v1/auth/login
- POST /api/v1/regions
- GET /api/v1/regions
- GET /api/v1/regions/bounds

## Tips:
- Use GeoJSON for shapes
- Store token via AuthService
- Use PostGIS for region queries
```
