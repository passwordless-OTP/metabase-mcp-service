# Makefile for MMS - Metabase MCP Service

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make setup       - Initial setup with sample data"
	@echo "  make dev         - Start development environment"
	@echo "  make test        - Run tests in Docker"
	@echo "  make logs        - Follow container logs"
	@echo "  make shell       - Shell into MCP container"
	@echo "  make clean       - Stop and remove all containers"
	@echo "  make reset       - Full reset including volumes"
	@echo "  make build       - Build production Docker image"

.PHONY: setup
setup:
	@echo "Setting up local development environment..."
	cp .env.example .env
	@echo "Please edit .env file with your configuration"
	docker-compose build
	docker-compose up -d postgres sample-db
	sleep 10  # Wait for databases
	./scripts/setup-sample-data.sh || true
	docker-compose up -d
	@echo "Setup complete! Access:"
	@echo "  - MCP Server: http://localhost:8080"
	@echo "  - Metabase: http://localhost:3000"

.PHONY: dev
dev:
	docker-compose up -d
	docker-compose logs -f mcp-server

.PHONY: test
test:
	docker-compose -f docker-compose.test.yml up --abort-on-container-exit

.PHONY: logs
logs:
	docker-compose logs -f

.PHONY: shell
shell:
	docker-compose exec mcp-server /bin/bash

.PHONY: clean
clean:
	docker-compose down

.PHONY: reset
reset:
	docker-compose down -v
	docker system prune -f

.PHONY: build
build:
	docker build -t mms:latest .