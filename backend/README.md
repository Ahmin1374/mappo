# Mappo Backend

Spring Boot backend for the real estate map drawing application with PostGIS geospatial support and JWT authentication.

## Features

- **Geospatial Data Management**: Store and query regions using PostGIS
- **JWT Authentication**: Secure API endpoints with JSON Web Tokens
- **RESTful API**: Full CRUD operations for regions
- **Spatial Queries**: Find regions within bounds, intersecting polygons, etc.
- **User Management**: Multi-user support with role-based access
- **Docker Support**: Containerized development environment

## Tech Stack

- **Framework**: Spring Boot 3.5.4 (Java 17+)
- **Database**: PostgreSQL 15 + PostGIS 3.3
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Spring Security
- **Testing**: JUnit 5, Mockito, Testcontainers
- **Build Tool**: Maven
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Java 17 or higher
- Docker and Docker Compose
- Maven (optional, wrapper included)

### 1. Start the Database

```bash
# Start PostgreSQL with PostGIS
docker-compose up db -d
```

### 2. Run the Application

```bash
# Using Maven wrapper
./mvnw spring-boot:run

# Or using Maven directly
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### 3. Test the API

```bash
# Health check
curl http://localhost:8080/api/v1/actuator/health

# Login (default credentials: admin/password)
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

## API Documentation

### Authentication

#### POST /api/v1/auth/login
Login and get JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "username": "admin",
  "role": "ADMIN"
}
```

### Regions

#### POST /api/v1/regions
Create a new region.

**Request:**
```json
{
  "name": "Berlin Center",
  "geoJson": {
    "type": "Polygon",
    "coordinates": [[[13.3777, 52.5163], [13.3777, 52.5163], [13.3777, 52.5163], [13.3777, 52.5163]]]
  }
}
```

#### GET /api/v1/regions
Get all regions for the current user (paginated).

#### GET /api/v1/regions/{id}
Get a specific region by ID.

#### PUT /api/v1/regions/{id}
Update a region.

#### DELETE /api/v1/regions/{id}
Delete a region.

#### GET /api/v1/regions/bounds
Find regions within a bounding box.

**Parameters:**
- `minX`: Minimum longitude
- `minY`: Minimum latitude
- `maxX`: Maximum longitude
- `maxY`: Maximum latitude

#### GET /api/v1/regions/search
Search regions by name.

**Parameters:**
- `name`: Search term

## Development

### Project Structure

```
src/main/java/com/mappo/backend/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── dto/            # Data Transfer Objects
├── model/          # JPA entities
├── repository/     # Data access layer
├── security/       # JWT and security components
└── service/        # Business logic
```

### Running Tests

```bash
# Run all tests
./mvnw test

# Run with coverage
./mvnw test jacoco:report
```

### Database Schema

The application creates the following tables:

- **regions**: Stores region data with PostGIS geometry
- **users**: User authentication and authorization

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | Database connection URL | `jdbc:postgresql://localhost:5432/realestate` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `secret` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-here` |
| `JWT_EXPIRATION` | JWT expiration time (ms) | `86400000` |

## Docker

### Build and Run

```bash
# Build the application
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Development with Docker

```bash
# Start only the database
docker-compose up db -d

# Run the application locally (connects to Docker database)
./mvnw spring-boot:run
```

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## License

This project is part of the Mappo real estate application. 