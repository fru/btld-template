FROM node:lts-alpine
WORKDIR /usr/app
COPY /root/btld-web/src/server/package*.json ./
RUN npm install
