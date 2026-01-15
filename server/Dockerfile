FROM golang:1.24.5-alpine AS builder
WORKDIR /app

COPY server/ ./pingspot/

# 2. Go into that folder to build
WORKDIR /app/pingspot

# 3. Now 'go build' finds go.mod in the current directory (.)
# And all imports starting with 'pingspot/...' work because they are local!
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/pingspot-binary ./cmd/main.go

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /app/pingspot-binary ./pingspot
RUN mkdir -p /app/uploads/main /app/uploads/user
EXPOSE 8080
CMD ["./pingspot"]