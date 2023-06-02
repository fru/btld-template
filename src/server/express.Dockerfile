FROM node:lts-alpine
WORKDIR /usr/app
COPY . ./
RUN npm install
