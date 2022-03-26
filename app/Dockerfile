FROM golang:1.18.0-alpine3.15 as builder

WORKDIR /app

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o server .

CMD ["/app"]

FROM scratch

EXPOSE 8080

WORKDIR /app

COPY --from=builder /app/server /usr/bin/

ENTRYPOINT ["server"]