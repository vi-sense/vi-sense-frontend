FROM node:14.2.0-alpine3.10 AS builder

WORKDIR /app

COPY . .
RUN npm install && npm run build

FROM alpine:latest

COPY --from=builder /app/dist /static

CMD sh