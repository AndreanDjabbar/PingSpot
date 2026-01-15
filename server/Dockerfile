FROM golang:1.24.5-alpine AS builder

# 1. Start at /app
WORKDIR /app

# 2. Copy the server folder from your computer into a folder named 'pingspot'
# Now /app/pingspot/go.mod exists
COPY server/ ./pingspot/

# 3. Move INTO the folder where go.mod is
WORKDIR /app/pingspot

# 4. Download dependencies
RUN go mod download

# 5. Build the binary
# We use 'pingspot' as the module root. 
# The compiler now finds "pingspot/pkg/apperror" because it is in the parent directory.
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/pingspot-binary ./cmd/main.go

# --- Final Stage ---
FROM alpine:3.20
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/pingspot-binary ./pingspot

# Create necessary directories
RUN mkdir -p /app/uploads/main /app/uploads/user

EXPOSE 8080

CMD ["./pingspot"]