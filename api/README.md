# api

Service + Business layer for CrowdRev. This project uses [koajs](http://koajs.com/) for the service layer. The business layer uses [PostgreSQL](https://www.postgresql.org/) as database.

## Requirements

- Node.js 8+
- PostgreSQL server 9.5+

## Configure

To run **api** first you have to create the `.env` configuration file. To do this, just copy the example file `.env.example` and edit it.

```shell
$ cp .env.example .env
```

For development mode, you just have to change `GOOGLE_CLIENT_SECRET` and `GOOGLE_CLIENT_ID`. You can create a google api key [here](https://console.developers.google.com/projectselector/apis/credentials)

## Run

To run **api** first install its dependencies:

```shell
$ npm install
```

### Database

As mentioned before, CrowdRev uses PostgreSQL. You can use docker to start a postgres server easily. If you don't have docker, go to the [docker community edition page](https://www.docker.com/community-edition) and follow the steps to install it in your platform. To start the server:

```
$ docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -d -p 5432:5432 postgres:9.5
```

##### Configure the database

Create a database based on the configuration parameters you define in your `.env` file.

##### Initialize the database

Run the script _src/db/init.sql_ to initialize the database.
Now you have the database up & running.

### Development mode

To run in development mode, just issue the following:

```
$ npm start
```

For debugging, you can start the server using the following:

```
$ npm run debug
```

The API should be available at http://localhost:4000/

### Production mode

To deploy the backend in production using heroku, you can do the following:

Install _heroku-config_ to sync our configuration file:

```
$ heroku plugins:install heroku-config
```

Push configuration file to heroku. Notice that you can store production configs in a file named _.env.prod_.

```
$ heroku config:push -f .env.prod
```

Deploy the backend (you should run this from the root directory)

```
$ git subtree push --prefix api heroku master
```

The API should be available at https://[NAME].herokuapp.com

# Contribute

## Testing

### Run the Task Assignment APIs

Before runnig the all the tests you should make sure that the following projects are running:

- [Task assignment Box - Baseline](https://github.com/TrentoCrowdAI/Task-Assignment-Box) on port 10000
- [Task assignment Box - Shortest Run](https://github.com/TrentoCrowdAI/MSR-Box) on port 5000

Both projects should configure the test database environment variable using the following:

```shell
$ export PGDATABASE=crowdrev-test
```

These two API projects are invoked by the tests that are inside the `src/test` folder. Simply ignore this step if you are not running any test inside the `src/test` folder.

## Running the tests

[jest](https://jestjs.io/) is used for running the tests.

To run the all the tests simply issue the following:

```shell
$ npm test
```
