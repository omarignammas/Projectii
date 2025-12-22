# 🗂️ Project Management App

  
  <p>
    <strong>A comprehensive full-stack application for managing projects and tasks efficiently</strong>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/PostgreSQL-12+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>

</div>

<br>

---

## 🎯 Overview

<table>
<tr>
<td width="50%">

### 🎨 Frontend
- **Framework:** React + Vite
- **UI Library:** shadcn/ui + Tailwind CSS
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **State Management:** Context API

</td>
<td width="50%">

### ⚙️ Backend
- **Framework:** Spring Boot 3.2
- **Authentication:** JWT (BCrypt)
- **ORM:** Spring Data JPA
- **Database:** PostgreSQL 12+
- **Testing:** JUnit 5 + Mockito (70%+ coverage)

</td>
</tr>
</table>

---

## ✨ Key Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | JWT-based auth with BCrypt password hashing |
| 📝 **Complete CRUD Operations** | Full Create, Read, Update, Delete for Projects & Tasks |
| 📊 **Real-time Progress Tracking** | Dynamic progress bars and completion statistics |
| 📱 **Responsive Design** | Optimized for Mobile, Tablet, and Desktop |
| 🌓 **Dark Mode Support** | Seamless theme switching with Tailwind CSS |
| 📄 **Advanced Pagination** | Frontend & Backend pagination for large datasets |
| 🧪 **Comprehensive Testing** | 70%+ code coverage with JUnit & Mockito |
| 🐳 **Fully Dockerized** | One-command deployment with Docker Compose |

</div>

---

## 🧰 Tech Stack

<div align="center">

### Frontend Technologies
<p>
  <img src="https://raw.githubusercontent.com/teamedwardforever/Readme-Generator/71f25dd8b98329b168142a6b782a107b75eab178/svg/Skills/Frontend/react-original-wordmark.svg" alt="React" width="50" height="50" />
  <img src="https://raw.githubusercontent.com/teamedwardforever/Readme-Generator/71f25dd8b98329b168142a6b782a107b75eab178/svg/Skills/Frontend/tailwindcss-icon.svg" alt="Tailwind" width="50" height="50" />
  <img src="https://raw.githubusercontent.com/teamedwardforever/Readme-Generator/71f25dd8b98329b168142a6b782a107b75eab178/svg/Skills/Languages/javascript-original.svg" alt="JavaScript" width="50" height="50" />
  <img src="https://raw.githubusercontent.com/teamedwardforever/Readme-Generator/71f25dd8b98329b168142a6b782a107b75eab178/svg/Skills/Languages/typescript-original.svg" alt="TypeScript" width="50" height="50" />
</p>

### Backend Technologies
<p>
  <img src="https://raw.githubusercontent.com/teamedwardforever/Readme-Generator/71f25dd8b98329b168142a6b782a107b75eab178/svg/Skills/Languages/java-original.svg" alt="Java" width="50" height="50" />
  <img src="https://raw.githubusercontent.com/teamedwardforever/Readme-Generator/71f25dd8b98329b168142a6b782a107b75eab178/svg/Skills/Backend/springio-icon.svg" alt="Spring Boot" width="50" height="50" />
  <img src="https://raw.githubusercontent.com/teamedwardforever/Readme-Generator/71f25dd8b98329b168142a6b782a107b75eab178/svg/Skills/Database/postgresql-original-wordmark.svg" alt="PostgreSQL" width="50" height="50" />
</p>

### DevOps & Tools
<p>
  <img src="https://raw.githubusercontent.com/teamedwardforever/Readme-Generator/71f25dd8b98329b168142a6b782a107b75eab178/svg/Skills/Devops/docker-original-wordmark.svg" alt="Docker" width="50" height="50" />
  <img src="https://raw.githubusercontent.com/teamedwardforever/Readme-Generator/71f25dd8b98329b168142a6b782a107b75eab178/svg/Skills/Other/git-scm-icon.svg" alt="Git" width="50" height="50" />
  <img src="https://raw.githubusercontent.com/teamedwardforever/Readme-Generator/71f25dd8b98329b168142a6b782a107b75eab178/svg/Skills/Software/getpostman-icon.svg" alt="Postman" width="50" height="50" />
</p>

</div>

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


## 📦 Installation & Setup

<div align="center">

### 🐳 Docker Setup (Recommended)

</div>

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/project-management-app.git
cd project-management-app
```

### 2️⃣ Environment Configuration

Create a `.env` file at the root:
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
# Build and start all containers
docker-compose up -d --build

# Check services status
docker-compose ps

# View logs
docker-compose logs -f backend
```

<div align="center">

| Service | URL |
|---------|-----|
| 🎨 Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8080 |
| 🗄️ PostgreSQL | localhost:5432 |

</div>

### 4️⃣ Stop Services
```bash
docker-compose down
```

---

<details>
<summary><b>🚀 Local Setup (Without Docker)</b></summary>

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

</details>

---

## 📡 API Endpoints

<div align="center">

**Global Prefix:** `/api/v1`

</div>

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and retrieve JWT Token |

### 📁 Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects` | List all projects (with pagination) |
| `POST` | `/projects` | Create a new project |
| `GET` | `/projects/:id` | Get project details |
| `PUT` | `/projects/:id` | Update a project |
| `DELETE` | `/projects/:id` | Delete a project |
| `GET` | `/projects/:id/progress` | Get completion percentage |

### ✅ Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects/:id/tasks` | List tasks for a project |
| `POST` | `/projects/:id/tasks` | Create a task within a project |
| `PATCH` | `/tasks/:id/complete` | Mark task as completed |
| `DELETE` | `/tasks/:id` | Delete a task |

---

## 🗄️ Database Maintenance

<details>
<summary><b>Database Backup & Restore</b></summary>

**Backup Database:**
```bash
docker exec projecty-postgres pg_dump -U admin projectydb > backup.sql
```

**Restore Database:**
```bash
docker exec -i projecty-postgres psql -U admin projectydb < backup.sql
```

</details>

---


## 📸 Screenshots

<div align="center">

### Dashboard
<img src="https://via.placeholder.com/800x400/0077B5/FFFFFF?text=Dashboard+Screenshot" alt="Dashboard" width="80%" />

### Project Details
<img src="https://via.placeholder.com/800x400/00D4FF/FFFFFF?text=Project+Details+Screenshot" alt="Project Details" width="80%" />

### Dark Mode
<img src="https://via.placeholder.com/800x400/1a1a1a/FFFFFF?text=Dark+Mode+Screenshot" alt="Dark Mode" width="80%" />

</div>

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

<div align="center">

Distributed under the **MIT License**. See `LICENSE` for more information.

</div>

---

## 👨‍💻 Author

<div align="center">

**Omar Ignammas**

[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/omar-ignammas)
[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/omarignammas)
[![Portfolio](https://img.shields.io/badge/-Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ignmas.me)

</div>

---

<div align="center">

### ⭐️ Star this repository if you find it helpful!

<img src="https://raw.githubusercontent.com/Trilokia/Trilokia/379277808c61ef204768a61bbc5d25bc7798ccf1/bottom_header.svg" width="100%" />

</div>
