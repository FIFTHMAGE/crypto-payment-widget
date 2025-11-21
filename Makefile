.PHONY: help install build test clean dev docker-up docker-down deploy

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing contracts dependencies..."
	cd contracts && npm install
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Done!"

build: ## Build all projects
	@echo "Building contracts..."
	cd contracts && npm run compile
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Done!"

test: ## Run all tests
	@echo "Testing contracts..."
	cd contracts && npm test
	@echo "Testing backend..."
	cd backend && npm test
	@echo "Done!"

test-coverage: ## Run tests with coverage
	@echo "Testing contracts with coverage..."
	cd contracts && npm run test:coverage
	@echo "Testing backend with coverage..."
	cd backend && npm run test:coverage
	@echo "Done!"

lint: ## Lint all projects
	@echo "Linting contracts..."
	cd contracts && npm run lint
	@echo "Linting backend..."
	cd backend && npm run lint
	@echo "Linting frontend..."
	cd frontend && npm run lint
	@echo "Done!"

lint-fix: ## Fix linting issues
	@echo "Fixing contracts..."
	cd contracts && npm run lint:fix
	@echo "Fixing backend..."
	cd backend && npm run lint:fix
	@echo "Fixing frontend..."
	cd frontend && npm run lint:fix
	@echo "Done!"

format: ## Format all code
	@echo "Formatting contracts..."
	cd contracts && npm run format
	@echo "Formatting backend..."
	cd backend && npm run format
	@echo "Formatting frontend..."
	cd frontend && npm run format
	@echo "Done!"

clean: ## Clean build artifacts
	@echo "Cleaning..."
	rm -rf contracts/artifacts contracts/cache contracts/typechain-types
	rm -rf backend/dist backend/node_modules/.cache
	rm -rf frontend/dist frontend/build
	@echo "Done!"

dev-contracts: ## Start local blockchain node
	cd contracts && npm run node

dev-backend: ## Start backend in development mode
	cd backend && npm run dev

dev-frontend: ## Start frontend in development mode
	cd frontend && npm run dev

docker-up: ## Start all services with Docker
	docker-compose up -d
	@echo "Services started!"
	@echo "Backend: http://localhost:3000"
	@echo "Frontend: http://localhost:3001"

docker-down: ## Stop all Docker services
	docker-compose down

docker-logs: ## Show Docker logs
	docker-compose logs -f

docker-rebuild: ## Rebuild and restart Docker services
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

deploy-contracts-sepolia: ## Deploy contracts to Sepolia
	cd contracts && npm run deploy:sepolia

deploy-contracts-mainnet: ## Deploy contracts to mainnet
	cd contracts && npm run deploy:mainnet

verify-contracts-sepolia: ## Verify contracts on Sepolia
	cd contracts && npm run verify:sepolia

verify-contracts-mainnet: ## Verify contracts on mainnet
	cd contracts && npm run verify:mainnet

migrate-db: ## Run database migrations
	cd backend && npm run migrate

seed-db: ## Seed database with test data
	cd backend && npm run seed

backup-db: ## Backup database
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U payment_user crypto_payment_widget > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup complete!"

restore-db: ## Restore database from backup (usage: make restore-db FILE=backup.sql)
	@echo "Restoring database from $(FILE)..."
	docker-compose exec -T postgres psql -U payment_user crypto_payment_widget < $(FILE)
	@echo "Restore complete!"

ci: lint test build ## Run CI checks (lint, test, build)

health-check: ## Check health of all services
	@echo "Checking backend health..."
	@curl -f http://localhost:3000/health || echo "Backend unhealthy"
	@echo "Checking frontend health..."
	@curl -f http://localhost:3001/health || echo "Frontend unhealthy"
