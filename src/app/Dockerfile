# Build environment
FROM golang:1.18.0-alpine3.15 as builder
RUN apk update
RUN apk add -U --no-cache ca-certificates && update-ca-certificates
WORKDIR /app
COPY . .
ENV GO111MODULE=on
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o server .
CMD ["/app"]

# Execution environment
FROM scratch
EXPOSE 8080
WORKDIR /app
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/server /usr/bin/
ENTRYPOINT ["server"]