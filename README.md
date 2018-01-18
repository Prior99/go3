# Go3

A webapplication for the popular game "Go". this is mainly meant to be a sample application for the
hybrid REST framework [hyrest](https://github.com/Prior99/hyrest).

A production environment is running on [go.92k.de](https://go.92k.de/).

## Setup

Yarn should be installed and available in the `$PATH`.

## Starting

### Server

To run the preliminary server in one terminal execute:

```
make run-server
```

If the server is not autoreloading on change, type `rs` and hit enter.

### Web Frontend

To run the web frontend execute, while a server is reachable:

```
make run-web
```

### A word on Push API Keys

The Makefile includes the variables for the Push API private and public key:

```
PUSH_PUBLIC_KEY=BOvA8EMZRyIYJme_TcJiYgUIYHt5GT0nU_tRhD4f_3b5_6g0Elq6Ov3k7dbcPX4uRs3DZ3T811oWs7EfXt9Gy3E
PUSH_PRIVATE_KEY=gknuPQ6bfyIkY0rSo_hL6E025Dej0XnE_qAU0TAoaM0
```

These are meant for testing purposes only and when building the release and executing the
server in production should be exchanged with a different set of keys.

When exchanging the keys make sure to drop all tokens from the database as otherwise the
server will try to send notifications to unauthorized endpoints.

## Executing the tests

You can run all tests using

```
make test
```

or watch them by running

```
yarn test --watch
```

## Linting

Makre sure your code has no linting errors by using:

```
make lint
```
