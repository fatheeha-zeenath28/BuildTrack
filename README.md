# 🏗️ BuildTrack – Construction Project Monitoring Platform

A full-stack MERN web application for monitoring construction projects with role-based access control.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

---

### 1. Clone / unzip the project
```
buildtrack/
├── backend/
└── frontend/
```

### 2. Backend Setup
```bash
cd buildtrack/backend
npm install

# Copy env file and configure
cp .env.example .env
# Edit .env: set your MONGO_URI and JWT_SECRET

# The uploads/ folder is included in this package (with a .gitkeep so it
# survives git/zip). If it's ever missing, just recreate it:
# mkdir uploads

# Seed demo data (optional but recommended)
node seed.js

# Start backend
npm run dev     # development (nodemon)
npm start       # production
```

Backend runs on: http://localhost:5000

### 3. Frontend Setup
```bash
cd buildtrack/frontend
npm install

# Optional: only needed if your backend isn't on http://localhost:5000
cp .env.example .env
# Edit .env: set VITE_API_BASE_URL to your backend's origin

npm run dev
```

Frontend runs on: http://localhost:5173

> Uploaded photos are served by the backend at `/uploads/...` and are loaded
> using `VITE_API_BASE_URL` (see `frontend/src/config.js`), so this is the
> one setting to change when deploying instead of localhost.

---

## 🔑 Demo Login Credentials

| Role     | Email                      | Password  |
|----------|----------------------------|-----------|
| Admin    | admin@buildtrack.com       | admin123  |
| Engineer | engineer@buildtrack.com    | eng123    |
| Client   | client@buildtrack.com      | client123 |

---

## 📁 Folder Structure

```
backend/
├── config/         # MongoDB connection
├── controllers/    # Business logic per module
├── middleware/
│   ├── auth.js         # JWT verification + role-level RBAC (protect, authorize)
│   ├── resourceAuth.js # Resource-level checks (e.g. engineer ↔ assigned project)
│   └── validate.js     # Request body validation for write endpoints
├── models/         # Mongoose schemas
├── routes/         # Express route definitions
├── uploads/        # Uploaded site photos (kept in the repo via .gitkeep)
├── seed.js         # Demo data seeder
└── server.js       # App entry point

frontend/src/
├── api.js          # Axios instance with JWT interceptor
├── config.js        # Configurable backend origin (VITE_API_BASE_URL) for file/photo URLs
├── context/        # AuthContext (global auth state)
├── pages/          # One file per page
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Projects.jsx
│   ├── ProjectDetail.jsx
│   ├── Tasks.jsx
│   ├── Reports.jsx
│   ├── Photos.jsx
│   └── Users.jsx
├── components/
│   └── layout/     # Sidebar + Layout shell
└── index.css       # Global design system styles
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint          | Access  | Description        |
|--------|-------------------|---------|--------------------|
| POST   | /api/auth/register| Public  | Register new user (always created as `client`; validated) |
| POST   | /api/auth/login   | Public  | Login, get JWT     |
| GET    | /api/auth/me      | Private | Get current user   |

### Projects
| Method | Endpoint              | Access           |
|--------|-----------------------|------------------|
| GET    | /api/projects         | All              |
| GET    | /api/projects/stats   | Admin            |
| GET    | /api/projects/:id     | All              |
| POST   | /api/projects         | Admin (validated) |
| PUT    | /api/projects/:id     | Admin, Engineer (engineer must be assigned to the project; validated) |
| DELETE | /api/projects/:id     | Admin            |

### Tasks
| Method | Endpoint        | Access           |
|--------|-----------------|------------------|
| GET    | /api/tasks      | All              |
| POST   | /api/tasks      | Admin, Engineer  |
| PUT    | /api/tasks/:id  | Admin, Engineer  |
| DELETE | /api/tasks/:id  | Admin            |

### Reports
| Method | Endpoint           | Access          |
|--------|--------------------|-----------------|
| GET    | /api/reports       | All             |
| POST   | /api/reports       | Admin, Engineer |
| DELETE | /api/reports/:id   | Admin           |

### Photos
| Method | Endpoint          | Access           |
|--------|-------------------|------------------|
| GET    | /api/photos       | All              |
| POST   | /api/photos       | Admin, Engineer  |
| DELETE | /api/photos/:id   | Admin, Engineer  |

### Users (Admin only)
| Method | Endpoint        | Access |
|--------|-----------------|--------|
| GET    | /api/users      | Admin  |
| PUT    | /api/users/:id  | Admin  |
| DELETE | /api/users/:id  | Admin  |

---

## 🗄️ Database Collections

- **Users** – name, email, hashed password, role (admin/engineer/client)
- **Projects** – title, description, location, status, progress%, budget, team refs
- **Tasks** – title, project ref, status, priority, dueDate
- **Reports** – title, content, weather, workers, issues array, project ref
- **Photos** – filename, url, caption, category, project ref

---

## 🛡️ Security Architecture

1. **JWT** – signed token issued on login, stored in localStorage, sent as `Authorization: Bearer <token>`
2. **protect middleware** – verifies token on every protected route
3. **authorize middleware** – checks `user.role` matches allowed roles (role-level RBAC)
4. **resourceAuth middleware** – e.g. `requireAssignedEngineer` on `PUT /api/projects/:id` checks that an engineer is actually assigned to the project they're editing, not just that their role is "engineer" (resource-level authorization, on top of role-level RBAC)
5. **Password hashing** – bcryptjs with salt rounds = 12
6. **Request validation** – `middleware/validate.js` checks required fields, types, ranges and enum values (e.g. project `progress` 0–100, valid `status`) before anything reaches the database
7. **No self-registration privilege escalation** – `POST /api/auth/register` always creates a `client` account; the `role` field is ignored server-side even if sent in the request body. Elevating a user to `engineer`/`admin` is only possible via `PUT /api/users/:id`, which is restricted to admins (Admin → User Management)

**Registration / role flow:**
```
New User
   ↓
Register  →  always created as "client" (enforced server-side)
   ↓
Admin → User Management → change role
   ↓
Engineer / Admin (only an existing admin can grant this)
```

---

## 🧪 Testing

### Manual API testing with curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@buildtrack.com","password":"admin123"}'

# Get projects (use token from above)
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Or use Postman / Thunder Client
Import the base URL: `http://localhost:5000/api`
Add header: `Authorization: Bearer <token>`

### Structured test checklist
For a full set of test cases (Auth, Admin, Engineer, Client — including the
security fixes above) with a suggested evidence table for your evaluation,
see **[TESTING.md](./TESTING.md)**.

---

## 🎓 Viva Q&A

**Q: Why MERN stack?**
A: MongoDB's flexible document model suits construction data (varied project attributes). Express and Node give a lightweight REST API. React provides a reactive UI with component reuse across roles.

**Q: Why JWT over sessions?**
A: JWT is stateless — the server doesn't store session data, making it horizontally scalable. The token carries the user's role, so authorization decisions happen in middleware without a database lookup.

**Q: How does RBAC work?**
A: Two middlewares chain together: `protect` verifies the token, `authorize('admin','engineer')` checks the role field decoded from the token. Routes only accessible to certain roles simply don't pass the middleware.

**Q: Why separate controllers from routes?**
A: Separation of concerns — routes define the URL/method mapping, controllers hold the business logic. This makes unit testing and code reuse easier.

**Q: How are photos stored?**
A: Multer saves files to the `/uploads` directory on disk and Express serves them as static files. The Photo document stores the relative URL path.
