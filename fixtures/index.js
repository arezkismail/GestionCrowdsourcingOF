var path = require('path'),
    fs   = require('fs');

var mongoose = require('../lib/config/mongoose').instance();


fs.readdirSync(__dirname).forEach(function (filename) {
    if (! filename.match(/\.js(on)?$/) || filename === 'index.js') {
        return;
    }

    var data = require('./' + filename),
        modelName = path.basename(filename, path.extname(filename));

    var model = mongoose.model(modelName);

    model.findOne(function (err, document) {
        if (document) {
            return;
        }

        model.create(data).then(function (created) {
            console.log('Loaded', modelName, 'fixture from', filename, ': ', created);
        });
    });
});
