SHELL:=/bin/bash

# These are test variables used for local testing.
PUSH_PUBLIC_KEY=BOvA8EMZRyIYJme_TcJiYgUIYHt5GT0nU_tRhD4f_3b5_6g0Elq6Ov3k7dbcPX4uRs3DZ3T811oWs7EfXt9Gy3E
PUSH_PRIVATE_KEY=gknuPQ6bfyIkY0rSo_hL6E025Dej0XnE_qAU0TAoaM0

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
	GO3_PUSH_PUBLIC_KEY="$(PUSH_PUBLIC_KEY)" \
	GO3_PUSH_KEY="$(PUSH_PRIVATE_KEY)" \
	yarn run test

.PHONY: test-watch
test-watch: node_modules
	GO3_PUSH_PUBLIC_KEY="$(PUSH_PUBLIC_KEY)" \
	GO3_PUSH_KEY="$(PUSH_PRIVATE_KEY)" \
	yarn run test --watch

.PHONY: run-android
run-android: node_modules
	yarn start:android

.PHONY: run-web
run-web: node_modules
	GO3_PUSH_PUBLIC_KEY=$(PUSH_PUBLIC_KEY) yarn start:web

.PHONY: run-server
run-server: node_modules db
	GO3_PUSH_PUBLIC_KEY="$(PUSH_PUBLIC_KEY)" \
	GO3_PUSH_KEY="$(PUSH_PRIVATE_KEY)" \
	yarn start:server

.PHONY: clean-db
clean-db:
	dropdb go3 || true

.PHONY: clean
clean:
	rm -Rf node_modules/
	rm -Rf server/

.PHONY: db
db:
	createdb go3 || true

.PHONY: deploy
deploy: release
	cd deploy && ansible-playbook go3.yml
