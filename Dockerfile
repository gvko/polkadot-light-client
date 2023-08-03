# Base
FROM node:16-alpine AS base

ENV PATH /node/app/node_modules/.bin:$PATH

RUN apk add --no-cache --update g++ python3 make curl bash

WORKDIR /node
RUN mkdir app && chown -R node:node .
USER node
WORKDIR /node/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node dist ./
RUN npm install --prod

# Development
FROM base AS dev
RUN npm install

# Build
FROM dev AS build
COPY --chown=node:node . .
RUN ["npm", "run", "build"]

# Production release
FROM base as prod

COPY --from=build /node/app ./
CMD ["node", "./dist/main.js"]
