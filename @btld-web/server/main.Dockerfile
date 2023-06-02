FROM node:lts-alpine
WORKDIR /usr/app/project
COPY ../../package*.json ../
RUN cd ..
RUN npm install
