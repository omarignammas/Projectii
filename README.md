
# 🗂️ Project Management App

Une application complète de gestion de projets et de tâches.
**Stack :** Frontend React (Vite/shadcn), Backend Spring Boot (JWT), Base de données PostgreSQL.

---

## 🧰 Technologies Utilisées

| Secteur | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, shadcn/ui, Tailwind CSS, React Router DOM, Axios, date-fns |
| **Backend** | Java 17+, Spring Boot, Spring Data JPA, JWT Authentication, Maven |
| **Database** | PostgreSQL 12+ |
| **DevOps** | Docker, Docker Compose, Volumes de données |

---


## 🏗️ Architecture du Projet

L'architecture est modulaire pour assurer la maintenabilité et la scalabilité.

### 📂 Structure Frontend (React)
```text
src/
├── components/
│   ├── ui/          # Composants de base (shadcn/ui)
│   ├── layout/      # Navbar, Sidebar, Layout wrappers
│   ├── projects/    # Composants spécifiques aux Projets
│   └── tasks/       # Composants spécifiques aux Tâches
├── pages/           # Pages principales (Dashboard, Login, ProjectDetails)
├── services/        # Configuration Axios et appels API
├── context/         # Gestion d'état global (AuthContext)
├── hooks/           # Custom Hooks (ex: useAuth)
└── lib/             # Utilitaires (formatage dates, classes CSS)

```

### 📂 Structure Backend (Spring Boot)

```text
com.project.management
├── audit            # Gestion automatique des dates (created_at, updated_at)
├── config           # Sécurité (SecurityConfig), CORS, Swagger
├── controller       # Couche de présentation (API REST)
├── dtos             # Objets de transfert de données
│   ├── request      # DTOs entrants
│   └── response     # DTOs sortants
├── entity           # Entités JPA (Project, Task, User)
├── exception        # Gestion globale des erreurs (GlobalExceptionHandler)
├── mapper           # Mapping Entity <-> DTO
├── repository       # Interfaces Spring Data JPA
├── security         # Filtres JWT, UserDetailsServiceImpl
└── service          # Logique métier

```

---

## 📦 Installation et Lancement (Docker)

C'est la méthode recommandée pour lancer tout l'environnement rapidement.

### 1️⃣ Cloner le projet

```bash
git clone <votre-repo>
cd projectii

```

### 2️⃣ Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

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

### 3️⃣ Lancer les services

```bash
# Lancer les conteneurs en arrière-plan
docker-compose up -d --build

# Vérifier que tout tourne (frontend:3000, backend:8080, db:5432)
docker-compose ps

```

Pour voir les logs en temps réel :

```bash
docker-compose logs -f backend
# ou
docker-compose logs -f frontend

```

### 4️⃣ Arrêter les services

```bash
docker-compose down

```

---

## 🚀 Lancement Local (Sans Docker)

Si vous préférez lancer les services manuellement sur votre machine.

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run

```

> API accessible sur : `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev

```

> Application accessible sur : `http://localhost:3000`

---

## 📡 API Endpoints

Préfixe global : `/api/v1`

### 🔐 Authentification

| Méthode | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Inscription nouvel utilisateur |
| `POST` | `/auth/login` | Connexion et récupération du Token JWT |

### 📁 Projets

| Méthode | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/projects` | Liste de tous les projets |
| `POST` | `/projects` | Créer un projet |
| `GET` | `/projects/:id` | Détails d'un projet |
| `PUT` | `/projects/:id` | Mettre à jour un projet |
| `DELETE` | `/projects/:id` | Supprimer un projet |
| `GET` | `/projects/:id/progress` | Obtenir le % de progression |

### ✅ Tâches

| Méthode | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/projects/:id/tasks` | Tâches d'un projet spécifique |
| `POST` | `/projects/:id/tasks` | Créer une tâche dans un projet |
| `PATCH` | `/tasks/:id/complete` | Marquer comme terminée |
| `DELETE` | `/tasks/:id` | Supprimer une tâche |

---

## ⚙️ Maintenance Base de Données

Les données sont persistées via le volume Docker `postgres-data`.

**Sauvegarder la base (Backup) :**

```bash
docker exec projecty-postgres pg_dump -U admin projectydb > backup.sql

```

**Restaurer la base (Restore) :**

```bash
docker exec -i projecty-postgres psql -U admin projectydb < backup.sql

```

---

## ✨ Fonctionnalités Clés

* **Auth Sécurisée :** JWT + BCrypt, Routes protégées côté React.
* **UI Moderne :** Utilisation de `shadcn/ui` pour des composants accessibles et élégants.
* **Gestion de Tâches :** Alertes visuelles pour les tâches en retard, barres de progression dynamiques.
* **Responsive :** Interface adaptée Mobile, Tablette et Desktop.
* **Feedback Utilisateur :** États de chargement (skeletons), Modales de confirmation, Toasts de notification.

---

## 📄 Licence
```
Distribué sous la licence MIT.
```
