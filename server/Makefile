all: build test

build:
	@echo "Building..."
	
	
	@go build -o main.exe cmd/main.go

up-dev:
	@echo "🔼 Docker Compose set up with dev environment..."
	@set COMPOSE_IGNORE_ENV_FILE=1 && docker-compose --env-file .env.dev up -d

run:
	@go run cmd/main.go

run-dev:
	@echo Running in development mode with Air...
	@set APP_ENV=development && air

run-prod:
	@echo Running in production mode...
	@set APP_ENV=production && go run cmd/main.go
	
run-test:
	@echo Running in test mode...
	@set APP_ENV=test && go run cmd/main.go

test:
	@echo "Testing..."
	@go test ./... -v

clean:
	@echo "Cleaning..."
	@rm -f main

generate-key:
	@go run scripts/keys.go
	@echo "✓ Keys generated in /keys directory."

.PHONY: all build run test clean watch
