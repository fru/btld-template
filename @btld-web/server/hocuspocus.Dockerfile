FROM node:lts-alpine
WORKDIR /usr/app/server
COPY package*.json ../
RUN cd ..
RUN npm install
