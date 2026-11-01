# TaskSphere — React Frontend

Modern, high-performance React frontend for the **Employee Task Management REST API**.

---

## 🚀 Features

- **Executive Dashboard**: Real-time KPI metrics, sprint completion rate, department workload distribution, and active tasks.
- **Interactive Kanban Board & List**:
  - 3-column Kanban workflow: `TO DO` ➔ `IN PROGRESS` ➔ `DONE`.
  - Quick advance buttons and status transitions via `PATCH /api/tasks/{id}/status`.
  - Assignee management dialog (`POST` & `DELETE /api/tasks/{taskId}/assignees/{employeeId}`).
- **Employee Directory**:
  - Multi-filter search (by name, department, task status).
  - Sorting (by ID, Name) & pagination controls.
  - Direct employee detail modal showing live assigned tasks (`GET /api/employees/{id}/tasks`).
- **Departments Hub**:
  - Headcount analytics & roster preview (`GET /api/departments/{id}/employees`).
  - Department creation, update, and deletion with validation handling.
- **Dark & Light Mode**: Curated color palettes with glassmorphism, glowing accents, and micro-animations.
- **Dual Live / Demo Engine**:
  - Automatically connects to Spring Boot on `http://localhost:8080` via Vite proxy (`/api`).
  - Seamlessly falls back to an interactive local state if backend is offline, allowing immediate testing and demonstration.
  - One-click ping & status badge in the header.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Connect to Backend
Make sure your Spring Boot backend is running on `http://localhost:8080`:
```bash
./mvnw spring-boot:run
```
The Vite dev server will automatically forward all `/api/*` calls directly to `http://localhost:8080` without any CORS issues or backend modifications.
