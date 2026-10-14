# Entity Relationship Diagram (ERD)

BuildTrack uses **MongoDB** (via Spring Data MongoDB), a document database, so
there are no foreign-key constraints enforced by the database engine itself.
References between documents (e.g. a Project's `admin` field) are modelled
the same way a relational foreign key would be — by storing the referenced
document's `id` — and the application layer (`*Service` classes) is what
"joins" them back together on read, the same role a relational database's
`JOIN` would normally play. This diagram documents those relationships,
each document's keys, and field data types.

```mermaid
erDiagram
    USER ||--o{ PROJECT : "manages (admin)"
    USER }o--o{ PROJECT : "assigned as engineer"
    USER }o--o{ PROJECT : "assigned as client"
    PROJECT ||--o{ TASK : "has"
    PROJECT ||--o{ REPORT : "has"
    PROJECT ||--o{ PHOTO : "has"
    USER ||--o{ TASK : "assignedTo"
    USER ||--o{ TASK : "createdBy"
    USER ||--o{ REPORT : "author"
    USER ||--o{ PHOTO : "uploadedBy"
    REPORT ||--o{ ISSUE : "embeds"

    USER {
        string id PK "MongoDB ObjectId"
        string name
        string email UK "unique index"
        string password "bcrypt hash, never returned to client"
        string role "admin | engineer | client"
        string phone
        string avatar
        datetime createdAt
        datetime updatedAt
    }

    PROJECT {
        string id PK
        string title
        string description
        string location
        string status "planning | active | on_hold | completed"
        int progress "0-100"
        date startDate
        date endDate
        double budget
        string admin FK "-> USER.id"
        array engineers FK "-> USER.id[]"
        array clients FK "-> USER.id[]"
        datetime createdAt
        datetime updatedAt
    }

    TASK {
        string id PK
        string title
        string description
        string project FK "-> PROJECT.id"
        string assignedTo FK "-> USER.id"
        string createdBy FK "-> USER.id"
        string status "pending | in_progress | completed | blocked"
        string priority "low | medium | high | critical"
        date dueDate
        datetime createdAt
        datetime updatedAt
    }

    REPORT {
        string id PK
        string project FK "-> PROJECT.id"
        string author FK "-> USER.id"
        string title
        string content
        string weather
        int workers
        datetime reportDate
        datetime createdAt
    }

    ISSUE {
        string description "embedded sub-document, no own id"
        string severity "low | medium | high"
    }

    PHOTO {
        string id PK
        string project FK "-> PROJECT.id"
        string uploadedBy FK "-> USER.id"
        string filename
        string url
        string caption
        string category "progress | issue | completion | other"
        datetime createdAt
    }
```

## Notes on the design

- **Keys** — every document has a MongoDB-generated `id` (`ObjectId`,
  serialized as a string) as its primary key. `User.email` has a unique
  index (`@Indexed(unique = true)` in `User.java`) acting as a natural/
  alternate key, enforced at the database level so two accounts can never
  share an email.
- **Relationships** —
  - `Project.admin` is a **one-to-many** reference (one admin manages many
    projects).
  - `Project.engineers` / `Project.clients` are **many-to-many** references,
    modelled as arrays of `User` ids rather than a relational join table —
    the standard document-database pattern for a small, bounded list.
  - `Task`, `Report`, and `Photo` each belong to exactly one `Project`
    (**many-to-one**) and reference the `User`(s) who created/authored/
    uploaded them.
  - `Report.issues` is **embedded** (not referenced) — issues have no
    independent existence outside their report, so they're nested
    sub-documents rather than a separate collection, which is the
    appropriate MongoDB modelling choice here (embed when the child always
    belongs to exactly one parent and is always read together with it).
- **Data types** — see the table columns above; enums (`status`, `role`,
  `priority`, `category`) are validated application-side (see
  `*Service` classes under `backend/src/main/java/com/buildtrack/service/`)
  since MongoDB itself doesn't enforce a SQL-style `CHECK` constraint.

## Viewing this diagram

GitHub renders Mermaid code blocks like the one above automatically when
viewing this file in a repository. It also renders in VS Code with the
"Markdown Preview Mermaid Support" extension, or by pasting the code block
into https://mermaid.live.
