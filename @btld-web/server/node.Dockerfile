FROM node:lts-alpine
WORKDIR /usr/app/project
RUN apt-get install git -y
COPY package*.json ../
RUN cd ..
RUN npm install
