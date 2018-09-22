FROM node:alpine

RUN mkdir /app
WORKDIR /app

COPY . /app
RUN npm i --production

CMD node index.js