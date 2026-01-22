# Docker Deployment Guide for BIS-SMS

This guide explains how to run the BIS-SMS application using Docker.

## Prerequisites

- Docker installed on your system ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

## Quick Start

### Using Docker Compose (Recommended)

1. Build and start the application:
   ```bash
   docker-compose up -d
   ```

2. Access the application at: http://localhost:3000

3. Stop the application:
   ```bash
   docker-compose down
   ```

### Using Docker CLI

1. Build the Docker image:
   ```bash
   docker build -t bis-sms:latest .
   ```

2. Run the container:
   ```bash
   docker run -d -p 3000:3000 --name bis-sms-app bis-sms:latest
   ```

3. Access the application at: http://localhost:3000

4. Stop and remove the container:
   ```bash
   docker stop bis-sms-app
   docker rm bis-sms-app
   ```

## Docker Features

### Health Check
The container includes a built-in health check that monitors the application status every 30 seconds. Check the health status with:
```bash
docker ps
```

### View Logs
```bash
# Using Docker Compose
docker-compose logs -f

# Using Docker CLI
docker logs -f bis-sms-app
```

### Security
The application runs as a non-root user (nodejs:1001) for enhanced security.

### Image Size
The image uses Alpine Linux (node:20-alpine) for a minimal footprint, typically under 200MB.

## Environment Variables

You can customize the following environment variables:

- `PORT`: Port number (default: 3000)
- `NODE_ENV`: Environment mode (default: production)

Example with custom port:
```bash
docker run -d -p 8080:8080 -e PORT=8080 --name bis-sms-app bis-sms:latest
```

## Development

For development with live reload, mount the source code as a volume:
```bash
docker run -d -p 3000:3000 -v $(pwd):/app --name bis-sms-dev bis-sms:latest
```

## Troubleshooting

### Container won't start
Check the logs:
```bash
docker logs bis-sms-app
```

### Port already in use
Change the host port mapping:
```bash
docker run -d -p 8080:3000 --name bis-sms-app bis-sms:latest
```

### Health check failing
The health check endpoint is at `/health`. Test it manually:
```bash
curl http://localhost:3000/health
```

## Production Deployment

For production deployment, consider:

1. Using a reverse proxy (nginx, traefik)
2. Setting up SSL/TLS certificates
3. Configuring proper logging and monitoring
4. Using orchestration tools (Kubernetes, Docker Swarm)
5. Setting up automated backups for data

## Support

For general application support, see [README.md](README.md)
For login credentials, see [LOGIN_CREDENTIALS.md](LOGIN_CREDENTIALS.md)
