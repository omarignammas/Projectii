# 🗂️ Project Management App

A comprehensive full-stack application for managing projects and tasks efficiently.
**Stack:** Frontend React (Vite/shadcn), Backend Spring Boot (JWT), Database PostgreSQL.

---

## 🧰 Tech Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | React, Vite, shadcn/ui, Tailwind CSS, React Router DOM, Axios, date-fns |
| **Backend** | Java 17+, Spring Boot, Spring Data JPA, JWT Authentication, Maven |
| **Testing** | JUnit 5, Mockito (>70% Coverage) |
| **Database** | PostgreSQL 12+ |
| **DevOps** | Docker, Docker Compose, Data Volumes |

---

## ✨ Key Features & Flows

### 🎨 UI & UX

* **Dark Mode Support:** Fully responsive interface with seamless Dark/Light mode switching using Tailwind CSS.
* **Modern Design:** Built with `shadcn/ui` for accessible and elegant components.
* **Responsive:** Optimized for Mobile, Tablet, and Desktop.

### ⚙️ Core Functionality

* **Secure Authentication:** Full JWT implementation (Login, Register) with BCrypt password encoding and protected React routes.
* **Complete CRUDs:** Create, Read, Update, and Delete operations for both Projects and Tasks.
* **Pagination:** Implemented on both Frontend and Backend for optimized performance with large datasets.

### 📊 Insights & Feedback

* **Project Stats:** Dynamic progress bars and calculation of project completion rates.
* **Visual Alerts:** Visual indicators for overdue tasks.
* **User Feedback:** Skeleton loading states, confirmation modals, and toast notifications.

### 🏗️ Engineering

* **Unit Testing:** Comprehensive test suite with over **70% code coverage**.
* **Dockerized:** Full `docker-compose` setup for easy deployment.

---

## 🏗️ Project Architecture

The architecture is modular to ensure maintainability and scalability.

### 📂 Frontend Structure (React)

```text
src/
├── components/
│   ├── ui/          # Base components (shadcn/ui)
│   ├── layout/      # Navbar, Sidebar, Layout wrappers
│   ├── projects/    # Project-specific components
│   └── tasks/       # Task-specific components
├── pages/           # Main pages (Dashboard, Login, ProjectDetails)
├── services/        # Axios config and API calls
├── context/         # Global state management (AuthContext)
├── hooks/           # Custom Hooks (e.g., useAuth, useTheme)
└── lib/             # Utilities (Date formatting, CSS classes)

```

### 📂 Backend Structure (Spring Boot)

```text
com.project.management
├── audit            # Automatic auditing (created_at, updated_at)
├── config           # Security (SecurityConfig), CORS, Swagger
├── controller       # Presentation layer (REST API)
├── dtos             # Data Transfer Objects
│   ├── request      # Input DTOs
│   └── response     # Output DTOs
├── entity           # JPA Entities (Project, Task, User)
├── exception        # Global Error Handling (GlobalExceptionHandler)
├── mapper           # Entity <-> DTO Mapping
├── repository       # Spring Data JPA Interfaces
├── security         # JWT Filters, UserDetailsServiceImpl
└── service          # Business Logic

```

---

## 📦 Installation & Setup (Docker)

This is the recommended method to get the entire environment running quickly.

### 1️⃣ Clone the repository

```bash
git clone <your-repo-url>
cd projectii

```

### 2️⃣ Environment Configuration

Create a `.env` file at the root of the project:

```env
# Database Configuration
POSTGRES_DB=projectydb
POSTGRES_USER=admin
POSTGRES_PASSWORD=secure_password_here

# JWT Configuration
JWT_SECRET_KEY=your_secure_secret_key_here
JWT_EXPIRATION=86400000

# API URL (Frontend connection)
VITE_API_URL=http://localhost:8080/api/v1

```

### 3️⃣ Start Services

```bash
# Build and start containers in the background
docker-compose up -d --build

# Verify services are running (frontend:3000, backend:8080, db:5432)
docker-compose ps

```

To view real-time logs:

```bash
docker-compose logs -f backend
# or
docker-compose logs -f frontend

```

### 4️⃣ Stop Services

```bash
docker-compose down

```

---

## 🚀 Local Setup (Without Docker)

If you prefer running services manually on your machine.

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run

```

> API accessible at: `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev

```

> Application accessible at: `http://localhost:3000`

---

## 📡 API Endpoints

Global Prefix: `/api/v1`

### 🔐 Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and retrieve JWT Token |

### 📁 Projects

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/projects` | List all projects (with pagination) |
| `POST` | `/projects` | Create a new project |
| `GET` | `/projects/:id` | Get project details |
| `PUT` | `/projects/:id` | Update a project |
| `DELETE` | `/projects/:id` | Delete a project |
| `GET` | `/projects/:id/progress` | Get completion percentage stats |

### ✅ Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/projects/:id/tasks` | List tasks for a specific project |
| `POST` | `/projects/:id/tasks` | Create a task within a project |
| `PATCH` | `/tasks/:id/complete` | Mark task as completed |
| `DELETE` | `/tasks/:id` | Delete a task |

---

## ⚙️ Database Maintenance

Data is persisted via the `postgres-data` Docker volume.

**Backup Database:**

```bash
docker exec projecty-postgres pg_dump -U admin projectydb > backup.sql

```

**Restore Database:**

```bash
docker exec -i projecty-postgres psql -U admin projectydb < backup.sql

```

---

## 📄 License

```text
Distributed under the MIT License.

```
