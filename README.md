# Employee Task Management REST API

A RESTful backend to manage **departments, employees and tasks**, built with Spring Boot.

## Features

- CRUD for employees, departments and tasks
- Department ↔ Employee (one-to-many), Employee ↔ Task (many-to-many) with assign/unassign
- Pagination and sorting on list endpoints
- Dynamic multi-filter search (department, name, task status) using JPA Specifications
- Request validation with clear field-level error messages
- Global exception handling with a consistent JSON error format (400, 404, 409, 500)
- Swagger / OpenAPI documentation
- Unit tests (JUnit 5, Mockito) and controller tests (`@WebMvcTest`, MockMvc)
- Profiles (`dev`, `prod`) and environment-variable based configuration

## Tech Stack

Java 17 · Spring Boot 4 · Spring Data JPA (Hibernate) · PostgreSQL · Lombok · springdoc-openapi · JUnit 5 · Mockito · Maven

## Architecture

`Controller → Service → Repository → PostgreSQL`

- **DTOs** separate the API from database entities
- **GlobalExceptionHandler** (`@RestControllerAdvice`) returns one error format everywhere
- N+1 queries avoided with `@EntityGraph` and `@BatchSize`

## Getting Started

### Prerequisites
- JDK 17+
- PostgreSQL running locally
- Maven (or use the included `mvnw`)

### Setup
1. Create the database:
   ```sql
   CREATE DATABASE employee_db;
   ```
2. Set environment variables:
   ```
   DB_PASSWORD=YOUR_DB_PASSWORD
   # optional (defaults shown)
   DB_URL=jdbc:postgresql://localhost:5432/employee_db
   DB_USERNAME=postgres
   ```
3. Run:
   ```
   ./mvnw spring-boot:run
   ```
4. Open Swagger UI: http://localhost:8080/swagger-ui.html

Tables are created automatically in the `dev` profile.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | List employees (filters, paging, sorting) |
| GET | `/api/employees/{id}` | Get one employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |
| GET | `/api/employees/{id}/tasks` | Tasks of an employee |
| GET/POST/PUT/DELETE | `/api/departments` | Manage departments |
| GET | `/api/departments/{id}/employees` | Employees of a department |
| GET/POST/PUT/DELETE | `/api/tasks` | Manage tasks |
| PATCH | `/api/tasks/{id}/status` | Change task status |
| POST / DELETE | `/api/tasks/{taskId}/assignees/{employeeId}` | Assign / unassign |

Example:
```
GET /api/employees?department=IT&name=ra&taskStatus=TODO&page=0&size=5&sortBy=name&direction=asc
```

Error format:
```json
{
  "timestamp": "2026-10-24T14:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/employees",
  "errors": { "name": "Name is required" }
}
```

## Running Tests

```
./mvnw test
```
(set `DB_PASSWORD` first; the context-load test needs the database)

## Screenshots

![Swagger UI](docs/swagger.png)

## Future Improvements

- JWT authentication with roles
- Docker / docker-compose setup
- Flyway database migrations
- Integration tests with Testcontainers

## Author
### Run with Docker (recommended)

1. Copy `.env.example` to `.env` and set `DB_PASSWORD` and `JWT_SECRET`.
2. Start everything:
   ```
   docker compose up --build
   ```
3. Open http://localhost:8080/swagger-ui.html

To create an admin: register a user, then
```
docker exec -it employee-db psql -U postgres -d employee_db -c "UPDATE users SET role='ADMIN' WHERE username='your_username';"
```

Stop: `docker compose down` (add `-v` to also delete the database).

Your Name · Abhishek