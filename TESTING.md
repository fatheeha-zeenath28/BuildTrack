# 🧪 BuildTrack – Testing Checklist & Evidence Guide

This checklist turns the project's manual testing into structured, repeatable
test cases you can walk through with Postman / Thunder Client / curl and
screenshot for evaluation evidence. Seed the database first so the roles
below exist:

```bash
cd backend
node seed.js
```

| Role     | Email                      | Password  |
|----------|-----------------------------|-----------|
| Admin    | admin@buildtrack.com       | admin123  |
| Engineer | engineer@buildtrack.com    | eng123    |
| Client   | client@buildtrack.com      | client123 |

For each case below: note the HTTP status you expected vs. got, and take a
screenshot of the request + response. That pairing (expected vs actual) is
what makes it good evidence, not just the screenshot alone.

---

## 1. Authentication

- [ ] **Register** — `POST /api/auth/register` with a new email → `201`, returns a token and a user with `role: "client"` (even if you try to pass `"role": "admin"` in the body — confirms the fix for the self-registration privilege-escalation issue).
- [ ] **Login** — `POST /api/auth/login` with a seeded account → `200`, returns a token.
- [ ] **Invalid password** — `POST /api/auth/login` with a wrong password → `401 Invalid email or password`.
- [ ] **JWT required** — call any protected route (e.g. `GET /api/projects`) with no `Authorization` header → `401 Not authorised, no token`.
- [ ] **JWT invalid/expired** — call a protected route with a garbage token → `401 Token invalid or expired`.
- [ ] **Logout** — (frontend) clears `localStorage` (`bt_token`, `bt_user`) and redirects to `/login`; confirm a subsequent page refresh does not restore the session.

## 2. Admin

- [ ] **Create project** — `POST /api/projects` as admin → `201`.
- [ ] **Create project — validation** — `POST /api/projects` with no `title`, or `progress: 150`, or `status: "bogus"` → `400` with an `errors` array (confirms the new validation middleware).
- [ ] **Edit project** — `PUT /api/projects/:id` as admin → `200`, changes saved.
- [ ] **Delete project** — `DELETE /api/projects/:id` as admin → `200`.
- [ ] **Manage users — promote** — `PUT /api/users/:id` with `{ "role": "engineer" }` as admin → `200`, role changes. This is the intended way to grant elevated roles (see item 1 fix).
- [ ] **Manage users — as non-admin** — same call using the client's or engineer's token → `403`.

## 3. Engineer

- [ ] **View assigned projects** — `GET /api/projects` as engineer → only returns projects where this engineer is in `engineers[]`.
- [ ] **Create tasks** — `POST /api/tasks` as engineer → `201`.
- [ ] **Update tasks** — `PUT /api/tasks/:id` as engineer → `200`.
- [ ] **Create reports** — `POST /api/reports` as engineer → `201`.
- [ ] **Upload photos** — `POST /api/photos` (multipart, field name `photo`) as engineer → `201`, and `GET /api/photos` afterwards shows the photo with `project.title` populated (confirms the item 2 fix) and a working image URL (confirms the item 4 fix).
- [ ] **Resource-level authorization** — as the seeded engineer, try `PUT /api/projects/:id` on a project where this engineer is **not** listed in `engineers[]` (e.g. temporarily create a project without assigning them, or use a second engineer account) → `403 You are not assigned to this project` (confirms the item 6 fix).

## 4. Client

- [ ] **View projects** — `GET /api/projects` as client → only returns projects where this client is in `clients[]`.
- [ ] **View reports** — `GET /api/reports` as client → `200`.
- [ ] **View photos** — `GET /api/photos` as client → `200`.
- [ ] **Cannot access admin functions** — `GET /api/users`, `POST /api/projects`, `DELETE /api/projects/:id` as client → all `403`.
- [ ] **Cannot self-promote** — attempt `PUT /api/users/:id` (even on their own account) as client → `403` (route-level `authorize('admin')` blocks it before the body is even read).

---

## Suggested evidence structure

For your submission, a simple table per test case works well:

| # | Test case | Expected | Actual | Screenshot |
|---|-----------|----------|--------|------------|
| 1 | Register with role=admin in body | user created with role=client | role=client | ✅ |
| 2 | ... | | | |

Grouping them by the four sections above (Auth / Admin / Engineer / Client)
mirrors the RBAC design and makes it easy for an examiner to follow.
