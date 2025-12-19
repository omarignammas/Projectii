🗂️ Project Management App

Application de gestion de projets et de tâches complète
Frontend en React + Vite avec shadcn/ui, backend en Spring Boot avec JWT, base de données PostgreSQL.

🧰 Technologies Utilisées

Frontend:

React + Vite

shadcn/ui (UI Components modernes)

Tailwind CSS

React Router DOM

Axios pour appels API

date-fns pour gestion des dates

Backend:

Java 17+

Spring Boot

Spring Data JPA

JWT Authentication

Maven

Database:

PostgreSQL 12+

DevOps / Deployment:

Docker & Docker Compose

Volumes pour persistance des données

Ports exposés : frontend 3000, backend 8080, PostgreSQL 5432

📦 Installation et Lancement (Docker)
1️⃣ Cloner le projet
git clone <votre-repo>
cd projectii

2️⃣ Structure du projet
projectii/
├─ docker-compose.yml
├─ frontend/
│  └─ Dockerfile
├─ backend/
│  └─ Dockerfile

3️⃣ Variables d’environnement

Créer un fichier .env à la racine :

# Database
POSTGRES_DB=projectydb
POSTGRES_USER=admin
POSTGRES_PASSWORD=secure_password_here

# JWT
JWT_SECRET_KEY=your_secure_secret_key_here
JWT_EXPIRATION=86400000

# API URL
VITE_API_URL=http://localhost:8080/api/v1

4️⃣ Lancer tous les services
docker-compose up -d --build


-d : détaché (background)

--build : reconstruit les images si nécessaire

5️⃣ Vérifier les conteneurs
docker-compose ps

6️⃣ Logs pour debug
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

7️⃣ Arrêter les conteneurs
docker-compose down

🚀 Lancement Local sans Docker
Frontend
cd frontend
npm install
npm run dev


Accessible sur http://localhost:3000

Backend
cd backend
mvn clean install
mvn spring-boot:run


Accessible sur http://localhost:8080

🎨 Frontend Features

Auth : Login / Register / JWT Protected Routes

Projets : CRUD complet, vue détaillée, progression

Tâches : CRUD complet, marque comme complété, alertes tâches en retard

UI : shadcn/ui composants modernes (Buttons, Cards, Inputs, Dialogs, Progress, Badges)

Responsive : mobile / tablet / desktop

Structure React
src/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── projects/
│   └── tasks/
├── pages/
├── services/
├── context/
├── hooks/
└── lib/

🔐 Backend Features

Auth JWT + BCrypt password hashing

CRUD Projets & Tâches

Suivi de progression des projets

Validation et gestion des erreurs

Architecture modulable et propre

Architecture
com.project.management
├── audit
├── config
├── controller
├── dtos
│   ├── request
│   └── response
├── entity
├── exception
├── mapper
├── repository
├── security
└── service

API Endpoints

Auth

POST /api/v1/auth/register

POST /api/v1/auth/login

Projects

GET /api/v1/projects

POST /api/v1/projects

GET /api/v1/projects/:id

PUT /api/v1/projects/:id

DELETE /api/v1/projects/:id

GET /api/v1/projects/:id/progress

Tasks

GET /api/v1/projects/:projectId/tasks

POST /api/v1/projects/:projectId/tasks

GET /api/v1/projects/:projectId/tasks/:taskId

PUT /api/v1/projects/:projectId/tasks/:taskId

PATCH /api/v1/projects/:projectId/tasks/:taskId/complete

DELETE /api/v1/projects/:projectId/tasks/:taskId

⚙️ Database

PostgreSQL

Volume postgres-data pour persistance

Backup
docker exec projecty-postgres pg_dump -U postgres projectydb > backup.sql

Restore
docker exec -i projecty-postgres psql -U postgres projectydb < backup.sql

🖥️ Production Recommendations

Utiliser Docker Secrets pour JWT et DB credentials

Serveur HTTPS (Nginx / Traefik)

Monitoring et Health checks

Configuration spécifique à l’environnement

🧪 Tests
Frontend

Tester UI et routes React

Vérifier intercepteurs Axios et JWT

Backend
cd backend
mvn test

🎁 Bonus Features

Indication des tâches en retard

Animation des transitions UI

Confirmation avant suppression

Etats de chargement

📄 License

MIT License
