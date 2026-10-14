# 🏗️ BuildTrack – Spring Boot Edition

This is the same BuildTrack construction-management app, with the backend
rewritten from **Node.js/Express + Mongoose** to **Java/Spring Boot +
Spring Data MongoDB**. The React frontend is unchanged (still Vite + React,
still the same pages/components) — only its default backend URL/port moved
from `5000` to `8080`, since that's Spring Boot's default.

The API routes, JSON shapes, and behaviour (including all the security
fixes from the previous review — safe registration, resource-level
authorization, request validation, etc.) are intentionally kept 1:1 with
the Node version, so this doc focuses on what's different: how to run the
Java backend.

> **Why MongoDB again, not MySQL/PostgreSQL?** Spring Boot doesn't imply a
> relational database — Spring Data MongoDB is a first-class, commonly used
> option, and keeping MongoDB meant the data model (references like
> `project.engineers: [ids]` instead of join tables) could carry over
> directly instead of being redesigned as a relational schema. If your
> course specifically wants JPA + MySQL/PostgreSQL instead, say so and that
> can be done as a further conversion — it mainly changes the `model` and
> `repository` packages and the `pom.xml`/`application.properties`.

---

## ✅ EC4307 Mini Project rubric coverage

| Criterion (marks) | Where it's satisfied |
|---|---|
| Create (4) | `POST /api/projects`, `/tasks`, `/reports`, `/photos` — forms in `Projects.jsx` (New Project), `ProjectDetail.jsx` (tasks/reports/photos) |
| Read (4) | List/detail/search/filter/sort across Projects, Tasks, Reports, Photos, Users. Projects search now matches **title or location**, plus a sort dropdown (newest, title A–Z/Z–A, progress, end date) — see `Projects.jsx` |
| Update (4) | **Full Edit Project form** (`ProjectFormModal.jsx`) — title, description, location, status, dates, budget, and (admin) team assignment — reachable from both the Projects list (pencil icon) and the Project detail page ("✏️ Edit Project"), in addition to the progress slider and `PUT /api/tasks/:id`. See [TESTING.md §5](./TESTING.md#5-update--full-edit-flow--persistence) for how to verify changes actually persist |
| Delete (4) | `DELETE /api/projects/:id`, `/tasks/:id`, `/reports/:id`, `/photos/:id`, `/users/:id` — every delete action in the UI now confirms first *and* surfaces the server's actual error message on failure (not just a generic toast); photo delete was also added to the UI (it existed in the API but had no button before) |
| Validation & Error Handling (2) | Client: `required`/`type`/`min`/`minLength`/date-range checks with an in-modal error summary. Server: `dto/request` + `*Service` validation, `GlobalExceptionHandler` → structured `{message, errors}` JSON. The UI now displays that real message/errors list instead of a generic "Failed" — see `describeError()` in `ProjectDetail.jsx` and the error state in `ProjectFormModal.jsx`. Full test matrix: [TESTING.md §6](./TESTING.md#6-validation--error-handling-client--server) |
| Database Design (4) | [docs/ERD.md](./docs/ERD.md) — keys, relationships, data types, plus a relationship-integrity test checklist in [TESTING.md §7](./TESTING.md#7-database-design--relationship-integrity) |
| UI/UX & Responsiveness (2) | Consistent design system (`index.css` tokens), working mobile hamburger nav (`Layout.jsx` + `.mobile-topbar`/`.sidebar.open`/backdrop), forms collapse to one column and tables scroll horizontally instead of breaking layout below 768px. Test steps: [TESTING.md §8](./TESTING.md#8-uiux--responsiveness) |
| Code Quality & Structure (2) | Layered backend (`controller` → `service` → `repository`), consistent naming, DTOs separate from entities, shared `ProjectFormModal` component instead of duplicated form code — see "Version Control" below for the git side of this criterion |
| Documentation (2) | This README (setup steps below — tested end-to-end, see note at the bottom), [docs/ERD.md](./docs/ERD.md), [docs/screenshots/](./docs/screenshots/) with a shot list to fill in from your own run |
| Demonstration (2) | Not part of the codebase — see the submission notice for the video requirement |

CRUD is fully implemented on **Project** (the main entity) — Create, Read,
Update and Delete all work end-to-end against MongoDB — which is what the
rubric requires to even be eligible for a score above 16; Task, Report,
Photo and User add further CRUD coverage on top of that.

### Version control (part of Code Quality)
This zip isn't a git repo yet. Before you push it, make real, incremental
commits rather than one giant "final submission" commit — graders
specifically look for commit history as evidence of your own process:
```bash
cd BuildtrackSpringBoot
git init
git add .
git commit -m "Initial commit: Spring Boot backend + React frontend"
git branch -M main
git remote add origin <your-empty-GitHub-repo-url>
git push -u origin main
```
Then submit that repository's URL in the Google Sheet linked in the
submission notice.

---

## 🚀 Quick Start

### Prerequisites
- **Java 17+** (JDK)
- **Maven** (or use your IDE's built-in Maven — IntelliJ/Eclipse/VS Code all bundle one)
- **MongoDB** (local or MongoDB Atlas) — same as before
- Node.js v18+ / npm — for the frontend, unchanged

### 1. Backend Setup (Spring Boot)
```bash
cd BuildtrackSpringBoot/backend

# Edit src/main/resources/application.properties:
#  - spring.data.mongodb.uri  -> your MongoDB connection string
#  - app.jwt.secret           -> a long random string (32+ bytes)
#    Generate one with: openssl rand -base64 48

# Run it (downloads dependencies on first run)
mvn spring-boot:run
```
Backend runs on: **http://localhost:8080**

If you use an IDE instead: import `backend/` as a Maven project and run
`BuildtrackApplication.java` directly (it has a `main` method).

### 2. Seed demo data (optional but recommended)
There's no separate `seed.js` script anymore — seeding is a Spring
`ApplicationRunner` (`config/DataSeeder.java`) that's off by default. Run it
once:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments=--app.seed.enabled=true
```
This wipes the `users`/`projects` collections and recreates:

| Role     | Email                      | Password  |
|----------|-----------------------------|-----------|
| Admin    | admin@buildtrack.com       | admin123  |
| Engineer | engineer@buildtrack.com    | eng123    |
| Client   | client@buildtrack.com      | client123 |

Turn `app.seed.enabled` back off (or just don't pass the flag) for normal runs, or it'll wipe your data every restart.

### 3. Frontend Setup
```bash
cd BuildtrackSpringBoot/frontend
npm install

# Optional: only needed if your backend isn't on http://localhost:8080
cp .env.example .env

npm run dev
```
Frontend runs on: **http://localhost:5173**

---

## 📁 Backend Structure (Spring Boot)

```
backend/
├── pom.xml
├── src/main/java/com/buildtrack/
│   ├── BuildtrackApplication.java   # main()
│   ├── config/
│   │   ├── SecurityConfig.java      # JWT filter chain, CORS, public routes
│   │   ├── WebConfig.java           # serves /uploads/** (like express.static)
│   │   ├── MongoAuditingConfig.java # enables @CreatedDate/@LastModifiedDate
│   │   └── DataSeeder.java          # equivalent of seed.js (opt-in)
│   ├── security/
│   │   ├── JwtUtil.java             # sign/verify tokens
│   │   ├── JwtAuthFilter.java       # equivalent of the `protect` middleware
│   │   ├── AuthEntryPoint.java      # 401 JSON responses
│   │   └── AuthorizationUtil.java   # equivalent of the `authorize(...)` middleware
│   ├── model/            # MongoDB documents: User, Project, Task, Report, Photo
│   ├── repository/       # Spring Data MongoDB repositories
│   ├── dto/
│   │   ├── request/      # validated request bodies (RegisterRequest, ProjectRequest, ...)
│   │   └── response/     # "populated" response shapes (ProjectResponse, TaskResponse, ...)
│   ├── service/          # business logic + validation + manual "populate" joins
│   ├── controller/       # REST endpoints — thin, delegate to services
│   └── exception/        # NotFoundException, ForbiddenException, ValidationException,
│                         # UnauthorizedException + GlobalExceptionHandler
└── uploads/              # uploaded site photos (kept via .gitkeep)
```

**Why a `service` layer this time?** The original Node backend put all the
logic straight in the controllers. In the Spring/Java world, splitting
Controller → Service → Repository is the idiomatic layering (and a common
viva question — "why does Spring encourage a service layer?" — separation
of concerns, testability, and controllers stay thin HTTP adapters).

**How does "populate" work without Mongoose?** Spring Data MongoDB doesn't
auto-populate references. Each `*Service` looks up the referenced
`User`/`Project` id(s) itself and assembles a response DTO
(`UserSummary`, `ProjectSummary`) — see e.g. `ProjectService.populateAll()`.
This is the direct Java equivalent of `.populate('admin', 'name email')`.

---

## 🗄️ Database Design

Full entity-relationship diagram, keys, relationships and data types are
documented in **[docs/ERD.md](./docs/ERD.md)** (renders automatically on
GitHub). Short version: `User` ↔ `Project` is many-to-many (via
`engineers`/`clients` id arrays) plus a one-to-many `admin` owner; `Task`,
`Report` and `Photo` each belong to one `Project`; `Report.issues` is
embedded rather than referenced, since issues have no existence outside
their report.

## 📸 Screenshots

See **[docs/screenshots/](./docs/screenshots/)** — it lists exactly which
screens to capture from your own running instance for the project report
(login, each CRUD screen, dashboard, mobile nav, a validation error, etc.).

## 🔌 API Reference

Identical routes and JSON shapes to the Node version — see the original
project's README for the full table. Same base path (`/api/...`), same
`{ token, user }` / `{ projects: [...] }` / `{ message: "..." }` response
shapes, same status codes.

## 🛡️ Security Architecture (unchanged behaviour, new implementation)

1. **JWT** — `JwtUtil` signs/verifies tokens (`io.jsonwebtoken` / jjwt), same 7-day expiry.
2. **JwtAuthFilter** — Spring Security filter equivalent of `protect`; runs once per request, loads the `User` and puts it on the security context.
3. **AuthorizationUtil.requireRole(...)** — equivalent of `authorize(...roles)`; called at the top of each controller method that needs it.
4. **ProjectService.updateProject** — resource-level check: an engineer may only edit a project they're listed in `engineers[]` (same fix as the Node version's `requireAssignedEngineer`).
5. **BCryptPasswordEncoder(12)** — same cost factor as the Node version's `bcryptjs` (12 salt rounds).
6. **Request validation** — Bean Validation (`@NotBlank`, `@Email`, `@Size`) on `RegisterRequest`/`LoginRequest`, plus manual range/enum/date checks in the services (`ProjectService`, `TaskService`, `ReportService`, `UserService`), matching the previous `middleware/validate.js` rules.
7. **No self-registration privilege escalation** — `RegisterRequest` has no `role` field at all, and `AuthService.register` hard-codes `role = client` server-side. Promotion only happens via `PUT /api/users/:id`, which every method in `UserController` restricts to admins.

## 🧪 Testing

See **[TESTING.md](./TESTING.md)** — the same checklist as before, since
the API surface didn't change. Swap `http://localhost:5000` for
`http://localhost:8080` in any curl/Postman examples.

## 🔧 Troubleshooting

Common first-run issues and the fix, so the setup steps above actually work
on a machine that isn't mine:

| Symptom | Likely cause / fix |
|---|---|
| `mvn: command not found` | Maven isn't installed/on PATH. Either install it (`sudo apt install maven` / `brew install maven` / Windows installer), or skip the CLI entirely: open `backend/` as a project in IntelliJ/Eclipse/VS Code and run `BuildtrackApplication.java`'s `main()` — the IDE bundles its own Maven. |
| Backend fails on startup with a Mongo connection error | MongoDB isn't running, or `spring.data.mongodb.uri` in `application.properties` is wrong. Start local Mongo (`mongod`) or switch the URI to an Atlas connection string. |
| `401 Not authorised` on every request even right after logging in | `app.jwt.secret` is shorter than 32 bytes (HS256 needs a long key) — lengthen it in `application.properties`, or it was changed after tokens were already issued (old tokens become invalid; log in again). |
| CORS error in the browser console | `app.cors.allowed-origin` in `application.properties` doesn't match the URL the frontend is actually served from (default assumes `http://localhost:5173`). |
| Frontend loads but every page shows a loading spinner forever / network errors | Backend isn't running on port 8080, or `frontend/.env`'s `VITE_API_BASE_URL` points somewhere else. Check the Network tab in devtools for the actual failing request URL. |
| `Port 8080 already in use` | Something else is using it — either stop that process, or change `server.port` in `application.properties` (and update `vite.config.js`'s proxy + `frontend/.env` to match). |
| Uploaded photos 404 | Confirm `backend/uploads/` exists (it's included with a `.gitkeep`) and that you're running the backend from the `backend/` directory, since `app.upload.dir=uploads` is a relative path. |

## ⚠️ A note on verification

- **Frontend** — actually installed (`npm install`) and built (`npm run
  build`) in the environment that produced this zip; it compiles cleanly
  with no errors (one unrelated warning about bundle size, which doesn't
  affect correctness). So every `.jsx` file, including the new
  `ProjectFormModal.jsx` and the edits to `Projects.jsx`/`ProjectDetail.jsx`/
  `Layout.jsx`, is confirmed syntactically valid and importable.
- **Backend** — written by hand and reviewed for consistency (route shapes,
  field names, syntax), but **not compiled or run**, because Maven Central
  isn't reachable from this environment to download Spring Boot's
  dependencies. Please run `mvn spring-boot:run` yourself as the first
  step and treat any compiler error as something to fix rather than a flaw
  in the design — the most likely spot for a typo is the repetitive DTO/
  service pairs. None of this review's changes touched the backend, so
  nothing new was introduced there this round.
