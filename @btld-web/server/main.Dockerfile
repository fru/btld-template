FROM node:lts-alpine
WORKDIR /usr/app/project
COPY ../../package.json ../
COPY ../../package-lock.json ../
RUN cd ..
RUN npm install
