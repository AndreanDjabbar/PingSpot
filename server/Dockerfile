FROM golang:1.24.5-alpine AS builder
WORKDIR /app

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o pingspot server/cmd/main.go

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /app/pingspot ./pingspot

RUN mkdir -p /app/uploads/main /app/uploads/user

EXPOSE 8080

CMD ["/app/pingspot"]