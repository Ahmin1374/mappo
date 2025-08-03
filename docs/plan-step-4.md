# 🔐🗺️ JWT Security + PostGIS Map Integration Plan

This phase focuses on securing the platform via JWT and enabling full map interactivity with PostGIS-backed spatial storage.

---

## 🎯 Goals

1. **🔐 Secure Auth + Role-Based Access**
2. **🗺️ Fully Functional Map + PostGIS Integration**

---

## ✅ Task Breakdown

### 🔐 JWT & Role-Based Access (Spring Boot)

#### Backend Security Tasks
- [ ] Secure all `/api/**` routes with JWT filter.
- [ ] Create custom annotation `@RoleRequired("ROLE")` or use `@PreAuthorize("hasRole('ROLE')")`.
- [ ] Enforce user roles:
  - `ADMIN`: Full access
  - `BROKER`: Own regions only
  - `VIEWER`: Read-only

#### Backend Enhancements
- [ ] Extend `User` entity: `roles` field
- [ ] Add `SecurityUtils.getCurrentUser()` to retrieve user from token.
- [ ] Apply access control logic in `RegionController`.

#### TDD Tests
- [ ] JWT parsing + validation unit test.
- [ ] Access denied/integration tests for unauthorized/unauthenticated requests.

---

## 📁 Suggested Backend Structure

```
/src
  /security
    JwtAuthFilter.java
    JwtUtil.java
    RoleGuard.java or annotations
  /controller
    RegionController.java
    AuthController.java
  /service
    RegionService.java
    UserService.java
  /domain
    Region.java
    User.java
  /repository
    RegionRepository.java
    UserRepository.java
  /dto
    RegionRequestDto.java
    RegionResponseDto.java
```
