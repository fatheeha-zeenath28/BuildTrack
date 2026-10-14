# Screenshots

The evaluation rubric's Documentation criterion asks for screenshots of the
user interfaces. These have to be captured from your own running app (I
can't generate real screenshots of a live UI from here), so this folder is
a placeholder — please add them before you submit.

## How to capture them

1. Start the backend (`cd backend && mvn spring-boot:run`) and the frontend
   (`cd frontend && npm run dev`).
2. Seed demo data so the screens have realistic content:
   `mvn spring-boot:run -Dspring-boot.run.arguments=--app.seed.enabled=true`
3. Log in as each role (see README for the seeded accounts) and capture:

| # | Suggested filename        | Screen |
|---|----------------------------|--------|
| 1 | `01-login.png`             | Login page |
| 2 | `02-register.png`          | Registration page (note: no role picker — see README security notes) |
| 3 | `03-dashboard-admin.png`   | Admin dashboard with stats |
| 4 | `04-projects-list.png`     | Projects list (Read) |
| 5 | `05-project-create.png`    | "New project" form (Create) |
| 6 | `06-project-detail.png`    | Project detail page: progress bar, tasks, reports, photos |
| 7 | `07-project-edit.png`      | Editing a project (Update) |
| 8 | `08-project-delete.png`    | Delete confirmation (Delete) |
| 9 | `09-tasks.png`             | Tasks board/list with status & priority |
| 10 | `10-reports.png`          | Daily reports list + create form |
| 11 | `11-photos.png`           | Photo gallery with upload |
| 12 | `12-users-admin.png`      | Admin → User Management, showing the role-change control |
| 13 | `13-mobile-nav.png`       | The site open on a narrow/mobile viewport with the nav menu open (demonstrates responsiveness) |
| 14 | `14-validation-error.png` | A form showing a validation error (e.g. empty required field, or a `400` response with field errors) |

4. Reference them from the main `README.md` (a "Screenshots" section with
   `![Projects list](docs/screenshots/04-projects-list.png)` for each one)
   and/or paste them into your Mini Project Report — whichever your
   lecturer wants them in, per the submission notice. Keep the report
   itself under the 10-page limit; if space is tight there, a handful of
   the most representative screens (login, one CRUD screen, dashboard,
   mobile view) is usually enough, with the rest left in this repo folder.
