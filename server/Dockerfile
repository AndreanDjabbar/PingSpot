FROM golang:1.24.5-alpine AS builder

WORKDIR /app

# 1. Copy everything from your server folder into /app
# Context is root, so we pull from server/
COPY server/ .

# 2. Download dependencies
# Now go.mod is at /app/go.mod
RUN go mod download

# 3. BUILD FIX:
# Instead of building ./cmd/main.go (which makes Go look for a 'pingspot' folder),
# we build using the module's absolute path logic or simply current dir logic.
# Because your go.mod is 'module pingspot', running build here 
# allows Go to map the module name to the current directory.
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/pingspot-binary ./cmd/main.go

# --- Final Stage ---
FROM alpine:3.20
WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/pingspot-binary ./pingspot

# Create necessary directories
RUN mkdir -p /app/uploads/main /app/uploads/user

# Copy the .env from the server folder context
COPY --from=builder /app/.env . 

EXPOSE 8080

CMD ["./pingspot"]