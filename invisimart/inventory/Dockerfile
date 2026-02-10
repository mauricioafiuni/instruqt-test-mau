FROM golang:1.24.4-alpine AS builder

RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o inventory-simulator main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/inventory-simulator .

CMD ["./inventory-simulator"]
