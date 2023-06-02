FROM node:lts-alpine
WORKDIR /usr/app
COPY ~/btld-web/src/server/package*.json ./
RUN npm install
