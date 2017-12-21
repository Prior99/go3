SHELL:=/bin/bash

default: debug

all: default lint db

.PHONY: debug
debug: node_modules
	yarn run build:web
	yarn run build:server

.PHONY: release
release: node_modules
	yarn run build:web:release
	yarn run build:server

.PHONY: node_modules
node_modules:
	yarn install

.PHONY: lint
lint: node_modules
	yarn run lint:src
	yarn run lint:style

.PHONY: test
test: node_modules
	yarn run test

.PHONY: run-android
run-android: node_modules
	yarn start:android

.PHONY: run-web
run-web: node_modules
	yarn start:web

.PHONY: run-server
run-server: node_modules db
	yarn start:server

.PHONY: clean-db
clean-db:
	dropdb go3 || true

.PHONY: clean
clean:
	rm -Rf dist/
	rm -Rf node_modules/
	rm -Rf server/

.PHONY: db
db:
	createdb go3 || true
