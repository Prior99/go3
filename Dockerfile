FROM node:8-alpine

WORKDIR /app

COPY package.json yarn.lock tsconfig.json server.sh /app/
COPY ./typings /app/typings
COPY ./src /app/src
RUN yarn install && yarn build:server

EXPOSE 4001
ENTRYPOINT ["/app/server.sh"]
