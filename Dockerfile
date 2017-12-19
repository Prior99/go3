FROM node:8-alpine

WORKDIR /app
# We copy the package.json here and then install the deps in order to make
# better use of Docker caching which goes top to bottom. This means that if we
# did it otherwise, we'd have to rebuild everything without caching each time
# the code changes.
COPY package.json /tmp
COPY yarn.lock /tmp
RUN cd /tmp && yarn install

COPY . /app
RUN rm -rf node_modules && \
    mv /tmp/node_modules /app/ && \
    yarn build:server

EXPOSE 4001
ENTRYPOINT ["/app/server.sh"]
