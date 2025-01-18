# RentWise

A Laravel application with React, TypeScript, and Docker setup.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Git

## Installation Steps

1. Clone the repository
```bash
git clone <your-repository-url>
cd rentwise
```

2. Create environment file
```bash
cp .env.example .env
```

3. Configure your `.env` file with the following database settings:
```env
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=rentwise
DB_USERNAME=rentwise
DB_PASSWORD=password
```

4. Build and start Docker containers
```bash
docker-compose up -d --build
```

5. Install PHP dependencies
```bash
docker-compose exec app composer install
```

6. Install Node.js dependencies
```bash
docker-compose exec node npm install
```

7. Generate application key
```bash
docker-compose exec app php artisan key:generate
```

8. Run database migrations
```bash
docker-compose exec app php artisan migrate
```

## Available Services

After installation, you can access:
- Main Application: [http://localhost:8000](http://localhost:8000)
- Vite Dev Server: [http://localhost:5173](http://localhost:5173)
- MySQL Database: localhost:3307
  - Database: rentwise
  - Username: rentwise
  - Password: password (or whatever you set in .env)

## Useful Docker Commands

### Start the application
```bash
docker-compose up -d
```

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild containers
```bash
docker-compose up -d --build
```

### Execute commands in containers

PHP Artisan commands:
```bash
docker-compose exec app php artisan [command]
```

NPM commands:
```bash
docker-compose exec node npm [command]
```

Composer commands:
```bash
docker-compose exec app composer [command]
```

### Clear all Docker cache
```bash
docker system prune -a --volumes
```

## Development Workflow

1. After making changes to PHP files:
   - Changes will be reflected immediately

2. After making changes to React/TypeScript files:
   - Changes will hot-reload automatically

3. After adding new packages:
   - For PHP packages:
     ```bash
     docker-compose exec app composer require [package-name]
     ```
   - For NPM packages:
     ```bash
     docker-compose exec node npm install [package-name]
     ```

4. Database changes:
   - Create migration:
     ```bash
     docker-compose exec app php artisan make:migration [migration_name]
     ```
   - Run migrations:
     ```bash
     docker-compose exec app php artisan migrate
     ```

5. Clear caches:
   ```bash
   docker-compose exec app php artisan config:clear
   docker-compose exec app php artisan cache:clear
   docker-compose exec app php artisan view:clear
   ```

## Directory Structure

```
rentwise/
├── app/                  # PHP application code
├── resources/
│   ├── js/              # React/TypeScript code
│   └── views/           # Blade templates
├── docker/              # Docker configuration files
│   ├── nginx/
│   └── php/
├── database/            # Database migrations and seeds
├── routes/              # Application routes
├── docker-compose.yml   # Docker services configuration
├── Dockerfile          # PHP application container
└── README.md           # This file
```

## Troubleshooting

1. If you get permission errors:
   ```bash
   docker-compose exec app chown -R www-data:www-data /var/www/storage
   docker-compose exec app chmod -R 775 /var/www/storage
   ```

2. If Vite doesn't connect:
   - Check if the node service is running:
     ```bash
     docker-compose ps
     ```
   - Restart the node service:
     ```bash
     docker-compose restart node
     ```

3. If database connection fails:
   - Ensure the database container is running:
     ```bash
     docker-compose ps
     ```
   - Check database logs:
     ```bash
     docker-compose logs db
     ```

4. If containers won't start:
   ```bash
   docker-compose down -v
   docker system prune -a --volumes
   docker-compose up -d --build
   ```

## Contributing

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

## License

[Your License Here]