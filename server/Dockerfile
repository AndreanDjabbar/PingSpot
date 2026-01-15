FROM golang:1.24.5-alpine AS builder

WORKDIR /app

# 1. Create a folder named 'pingspot' inside the container
# This is the secret! It makes the path /app/pingspot/pkg/apperror exist.
RUN mkdir pingspot

# 2. Copy the contents of your local 'server' folder into '/app/pingspot'
COPY server/ ./pingspot/

# 3. Move into the pingspot directory
WORKDIR /app/pingspot

# 4. Download dependencies
# Now go.mod is at /app/pingspot/go.mod
RUN go mod download

# 5. Build the binary
# Go will now find "pingspot/pkg/apperror" because it's looking in the current module
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/pingspot-binary ./cmd/main.go

# --- Final Stage ---
FROM alpine:3.20
WORKDIR /app

# Copy the binary from the builder
COPY --from=builder /app/pingspot-binary ./pingspot

# Create necessary directories
RUN mkdir -p /app/uploads/main /app/uploads/user

# Copy the .env from the pingspot folder
COPY --from=builder /app/pingspot/.env . 

EXPOSE 8080

CMD ["./pingspot"]