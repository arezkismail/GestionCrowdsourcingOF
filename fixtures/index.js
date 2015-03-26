var path = require('path'),
    fs   = require('fs'),
    _    = require('lodash');


/** Load all fixtures from the given folder if the matching collection is empty.
*
*@param  {Object}    [options]    May contain:
*     -  {Mongoose}       [mongoose = connect(process.env.MONGODB_URL)]   The Mongoose connection to use to load fixtures to.
*     -  {String}         [source = dirname]  Path to the directory containing model-named JS or JSON files defining document attributes to insert.
*     -  {Array<String>}  [models = _all_]  The subset of models to load fixtures for.
*     -  {Boolean}        [force = false]   Always load the fixtures, even if the collection is not empty.
*/
exports.loadFixtures = function (options) {
    var config = _.clone(options);

    if (! config.mongoose) {
        config.mongoose = require('mongoose');
        config.mongoose.connect(process.env.MONGODB_URL);
        require('../lib/config/mongoose').init(config.mongoose);
    }

    _.defaults(config, {
        source: __dirname,
        models: [],
        force : false
    });

    return loadFixtures(config);
}


/**
*@private
*/
function loadFixtures(config) {
    fs.readdirSync(config.source).forEach(function (filename) {
        if (! filename.match(/\.js(on)?$/) || filename === 'index.js') return;

        var modelName = path.basename(filename, path.extname(filename));

        if (config.models.length && ! _.contains(config.models, modelName)) return;

        var data = require('./' + filename),
            model = config.mongoose.model(modelName);

        model.findOne(function (err, document) {
            if (! config.force && document) return;

            model.create(data).then(function () {
                _.toArray(arguments).forEach(function (createdDoc) {
                    console.log('Loaded', modelName, 'fixture from', filename, ': ', createdDoc);
                });

                console.log('====\nLoaded', arguments.length, modelName, 'fixtures from', filename, '\n====');
            }, function (error) {
                console.error('Could not load', modelName, 'fixture from', filename, ': ', error);
            }).end();
        });
    });
}
