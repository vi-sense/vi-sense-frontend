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

FROM scratch as production
COPY --from=builder /app/dist /static