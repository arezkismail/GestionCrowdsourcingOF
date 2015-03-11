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
- `onCreate`: an async function that takes two params: the `test` object as stored in the database and a callback. You will have to call the callback with an error as the first parameter, and the possibly-transformed `test` object as the second.


### Fill the database

To manage tests, you will need to fill the `Users` collection.

If you want to add tests directly through shell, the name of the collection storing the tests is `AcceptanceTest`. Its schema is defined in `lib/models`.


Configuration
-------------

### Possible values

 In order to display human-readable results, you have to define the possible values that will be computed by the API.

- `id`: the value identifier that will be computed by the `simulate` function.
- `label`: a complete label that will be displayed to the user.
- `shortLabel`: a shorter label for the user to be used in table layouts.
- `hasMontant`: boolean. Set to `true` if the expected value is a number, set to `false` otherwise.
