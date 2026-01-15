FROM golang:1.24.5-alpine AS builder

WORKDIR /app

# Copy go mod files (they're now at the root of the context)
COPY go.mod go.sum ./
RUN go mod download

# Copy all source code
COPY . .

# Build the application (main.go is now at ./cmd/main.go relative to context)
RUN CGO_ENABLED=0 GOOS=linux go build -o pingspot ./cmd/main.go

FROM alpine:3.20
WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/pingspot .

# Create upload directories
RUN mkdir -p /app/uploads/main /app/uploads/user

EXPOSE 8080

CMD ["./pingspot"]