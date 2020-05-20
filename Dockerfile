FROM node:14.2.0-alpine3.10 AS base

WORKDIR /app

COPY package.json .
RUN npm install

FROM base AS develop
COPY *.* ./
RUN mkdir public
ENTRYPOINT npm run dev_docker

FROM base AS builder
COPY . .
RUN npm run build

#build go static file server minimal image
#source: https://github.com/chemidy/smallest-secured-golang-docker-image/blob/master/go_module/Dockerfile
############################
# STEP 1 build executable binary
############################
# golang alpine 1.14.1
FROM golang@sha256:244a736db4a1d2611d257e7403c729663ce2eb08d4628868f9d9ef2735496659 as gobuilder

# Install git + SSL ca certificates.
# Git is required for fetching the dependencies.
# Ca-certificates is required to call HTTPS endpoints.
RUN apk update && apk add --no-cache git ca-certificates tzdata && update-ca-certificates

# Create appuser
ENV USER=appuser
ENV UID=10001

# See https://stackoverflow.com/a/55757473/12429735
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"
WORKDIR $GOPATH/src/mypackage/myapp/

# use modules
COPY server/go.mod .

ENV GO111MODULE=on
RUN go mod download
RUN go mod verify

COPY server/. .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
      -ldflags='-w -s -extldflags "-static"' -a \
      -o /go/bin/visense-frontend .

############################
# STEP 2 build a small image
############################
FROM scratch AS production

# Import from builder.
COPY --from=gobuilder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=gobuilder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=gobuilder /etc/passwd /etc/passwd
COPY --from=gobuilder /etc/group /etc/group

# Copy our static executable
COPY --from=gobuilder /go/bin/visense-frontend /go/bin/visense-frontend
# Use an unprivileged user.
USER appuser:appuser

#Copy the vue static files
COPY --from=builder /app/dist /static

# Run the hello binary.
ENTRYPOINT ["/go/bin/visense-frontend"]

