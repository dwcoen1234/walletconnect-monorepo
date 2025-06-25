FROM node:21-alpine AS base

WORKDIR /

RUN apk --update --no-cache \
    add g++ make python3

FROM base AS build

WORKDIR /

COPY ../ ./
RUN npm ci
RUN npm run build

WORKDIR /packages/sign-client/

CMD ["node", "-v"]