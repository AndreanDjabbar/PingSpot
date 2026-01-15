FROM golang:1.24.5-alpine AS builder

WORKDIR /app

COPY server/ .

RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -o pingspot ./cmd

FROM alpine:3.20
WORKDIR /app

COPY --from=builder /app/pingspot .

RUN mkdir -p /app/uploads/main /app/uploads/user

EXPOSE 8080

CMD ["./pingspot"]