# 🧪 BuildTrack – Testing Checklist & Evidence Guide

This checklist turns the project's manual testing into structured, repeatable
test cases you can walk through with Postman / Thunder Client / curl and
screenshot for evaluation evidence. Seed the database first so the roles
below exist:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments=--app.seed.enabled=true
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

## 5. Update — full edit flow & persistence

The Projects page and the Project detail page both now have a full **Edit
Project** form (title, description, location, status, dates, budget, and —
for admins — engineer/client assignment), not just the progress slider.

- [ ] **Edit from the list** — Projects page → pencil icon on a project card (admin only) → change the title and status → Save → card updates immediately.
- [ ] **Edit from detail** — open a project → "✏️ Edit Project" button in the header → change the budget and end date → Save.
- [ ] **Persistence across reload** — after either edit above, **refresh the browser (F5)** and confirm the changed values are still there (this proves the write actually reached MongoDB and isn't just local React state).
- [ ] **Persistence via API** — `GET /api/projects/:id` directly (Postman/curl) after an edit and confirm the response reflects the new values.
- [ ] **Progress slider** — still works independently (`ProjectDetail.jsx`'s "Overall Progress" card) — drag it, click Update, refresh, confirm it persisted.
- [ ] **Task status update** — Tasks tab → change a task's status via `PUT /api/tasks/:id` → refresh → persisted.
- [ ] **Engineer editing their own assigned project** — log in as the seeded engineer, open a project they're assigned to, edit it → `200`, saved (no engineer/client re-assignment fields shown to them, since `GET /api/users` is admin-only — see `canAssignUsers` in `ProjectFormModal.jsx`).
- [ ] **Engineer editing a project they're NOT assigned to** — should fail with `403 You are not assigned to this project`, shown as a toast, not a silent failure or a generic error.

## 6. Validation & error handling (client + server)

- [ ] **Required field, client-side** — try to submit the Create/Edit Project form with an empty title → the browser blocks submission (HTML5 `required`) before any network call.
- [ ] **Required field, server-side** — bypass the client (e.g. curl `POST /api/projects` with `{}`) → `400` with `{ "message": "Validation failed", "errors": ["title is required"] }`.
- [ ] **Date range** — in the Edit/Create form, set an end date before the start date → client blocks it (red error summary in the modal) *and* if you bypass the client, the server also rejects it (`endDate cannot be before startDate`).
- [ ] **Invalid enum value** — `PUT /api/projects/:id` with `"status": "bogus"` → `400`, lists the allowed values.
- [ ] **Out-of-range number** — `PUT /api/projects/:id` with `"progress": 150` → `400` (`progress must be a number between 0 and 100`); try a negative `budget` too.
- [ ] **Password length** — Register with a 3-character password → blocked client-side (`minLength=6`) and server-side (`400`) if bypassed.
- [ ] **Readable errors in the UI, not just the console** — every form above shows the *actual* server message via toast or the modal's error list (see `describeError()` in `ProjectDetail.jsx` and the `errors` state in `ProjectFormModal.jsx`) — open devtools Network tab once to confirm the UI text matches the response body, not a generic "Something went wrong".
- [ ] **Failed deletes surface a reason** — try deleting a project as a non-admin (should be blocked by the UI, but also try the raw API call) → `403` with a message, and confirm the UI's delete button shows that message via toast rather than failing silently.

## 7. Database design — relationship integrity

Cross-reference with [docs/ERD.md](./docs/ERD.md) while doing this section.

- [ ] **Project ↔ User (admin)** — create a project as admin A; confirm `project.admin` in the API response is admin A's id, and the UI shows the right admin-created project list.
- [ ] **Project ↔ User (engineers/clients, many-to-many)** — assign the same engineer to two different projects; confirm `GET /api/projects` as that engineer returns both (the `engineers` array is doing its job as a many-to-many link).
- [ ] **Project → Task (one-to-many)** — add two tasks to the same project; `GET /api/tasks?project=<id>` returns both, each with `task.project.title` populated (confirms the reference, not just a raw id).
- [ ] **Project → Report (one-to-many)** — same check with `GET /api/reports?project=<id>`.
- [ ] **Project → Photo (one-to-many)** — same check with `GET /api/photos?project=<id>`; confirm `photo.project.title` is populated (this was the exact bug fixed earlier in the Node version, and the equivalent is `PhotoService.populate()` here).
- [ ] **Report → Issue (embedded)** — add an issue to a report (if your UI/Postman call includes `issues`) and confirm it comes back nested inside that report, not as a separate top-level entity — it has no independent id.
- [ ] **Referential consistency after delete** — delete a task's project; confirm what happens to the orphaned task reference (note this as a known limitation if nothing cascades — MongoDB doesn't enforce FK constraints, so this is a good thing to mention in your report's "limitations" section if you haven't added cascading deletes).

## 8. UI/UX & responsiveness

- [ ] **Resize to mobile width** (DevTools → toggle device toolbar, or an actual phone) — at ≤768px, the sidebar should hide and a ☰ button appears in a top bar.
- [ ] **Mobile nav toggle** — tap ☰ → sidebar slides in over a dark backdrop; tap the backdrop (or a nav link) → it closes again.
- [ ] **Forms at mobile width** — open the Create/Edit Project modal at a narrow width → two-column rows (e.g. Start/End date) stack into one column (`form-row` → `1fr` under the `@media (max-width:768px)` rule).
- [ ] **Tables at mobile width** — Tasks table on a project's Tasks tab → doesn't overflow the viewport; it scrolls horizontally within its own `.table-wrap` container instead of breaking the page layout.
- [ ] **Tap targets** — buttons and nav items are comfortably tappable (not too small/close together) at mobile width.
- [ ] **Desktop unaffected** — confirm none of the above changed the desktop (>768px) layout.

---

## Suggested evidence structure

For your submission, a simple table per test case works well:

| # | Test case | Expected | Actual | Screenshot |
|---|-----------|----------|--------|------------|
| 1 | Register with role=admin in body | user created with role=client | role=client | ✅ |
| 2 | ... | | | |

Grouping them by the four sections above (Auth / Admin / Engineer / Client)
mirrors the RBAC design and makes it easy for an examiner to follow.
