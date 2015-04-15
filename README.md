Storage and execution API for Ludwig, the collaborative testing tool
====================================================================

> API de stockage et d'exécution de l'outil de test collaboratif Ludwig.


[![Build Status](https://secure.travis-ci.org/sgmap/ludwig-api.svg)](http://travis-ci.org/sgmap/ludwig-api)
[![Dependency Status](https://david-dm.org/sgmap/ludwig-api.svg)](https://david-dm.org/sgmap/ludwig-api)
[![Dev Dependency status](https://david-dm.org/sgmap/ludwig-api/dev-status.svg)](https://david-dm.org/sgmap/ludwig-api#info=devDependencies&view=table)
[![Code Climate](https://codeclimate.com/github/sgmap/ludwig-api/badges/gpa.svg)](https://codeclimate.com/github/sgmap/ludwig-api)
[![Test Coverage](https://codeclimate.com/github/sgmap/ludwig-api/badges/coverage.svg)](https://codeclimate.com/github/sgmap/ludwig-api)


Usage
-----

Add `ludwig-api: "sgmap/ludwig-api"` as a dependency in your `package.json`, and then `require` it.

The `ludwig-api` module exports a single function that takes a single configuration object as a parameter and returns an [Express](http://expressjs.com) middleware.
This means you should use it somehow like this: `app.use('/api', require('ludwig-api')(apiConf))`, with `app` being an Express app and `apiConf` an object with values as follow.

- `mongoose`: optional, if you want to reuse an existing Mongoose connection. If not, you will need to set the `MONGODB_URL` environment variable and have it point to a running MongoDB instance.
- `simulate`: an async function that takes two params: the `test` object as stored in the database and a callback. You will have to call the callback with an error as the first parameter, and the execution result as the second.
- `onCreate`: an opportunity to do something to a test when it is created. An async function that takes two params: the `test` object that is about to be stored in the database and a callback. You will have to call the callback with an error as the first parameter, and the possibly-transformed `test` object as the second. **Optional**, defaults to doing nothing.


### Fill the database

To manage tests, you will need to fill the `Users` collection.
The easiest way to do this is to define them in JSON in `fixtures/User.json`, and then run `npm run load-fixtures`.

If you want to add tests directly through shell, the name of the collection storing the tests is `AcceptanceTest`. Its schema is defined in `lib/models`.


Configuration
-------------

### Possible values

In order to display human-readable results, you have to define the possible values that will be computed by the API.
These values are passed with the `possibleValues` option, as an array of objects with the following properties:

- `id`: the value identifier that will be computed by the `simulate` function.
- `label`: a complete label that will be displayed to the user.
- `shortLabel`: a shorter label for the user to be used in table layouts.
- `hasMontant`: boolean. Set to `true` if the expected value is a number, set to `false` otherwise.


Authentication
--------------

Only logged-in users may filter and modify tests.

If no user is defined in the database when you first start the app, a test user will be added for you. See the `fixtures` folder to get its login information.


### Public routes

A path is accessible without being logged-in: `<api mount point>/public/acceptance-tests`.

- `GET`ting this route will return an JSON-encoded array listing all validated tests available in the database. The `keyword` query may be used to list only validated tests with all specified keywords.
- `POST`ing to this route will create a new acceptance test in `unclaimed` state. However, one will need to be authenticated to edit it.
