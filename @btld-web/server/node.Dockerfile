FROM node:lts-alpine
WORKDIR /usr/app/project
RUN apk add --no-cache git
COPY package*.json ../
RUN cd ..
RUN npm install
