FROM node:lts-alpine
WORKDIR /usr/app/project
RUN apk add --no-cache git
