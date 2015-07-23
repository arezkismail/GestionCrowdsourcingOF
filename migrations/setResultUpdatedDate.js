var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/dds');

require('../lib/config/mongoose').init(mongoose);
require('../lib/models/acceptanceTest');

var AcceptanceTest = mongoose.model('AcceptanceTest');

var AcceptanceTestActivity = mongoose.model('AcceptanceTestActivity');

var stream = AcceptanceTest.find().stream();

stream.on('data', function(acceptanceTest) {

    AcceptanceTestActivity
        .findOne({
            type: 'results_update',
            acceptanceTest: acceptanceTest._id
        }, {}, {
            sort: '-date'
        }, function(err, activity) {
            if (err) return console.trace(err);
            if (!activity) return ;
            acceptanceTest
                .set('resultUpdated', activity.date)
                .save(function(err, data) {
                    if (err) return console.trace(err);
                });
        });

});

stream.on('end', function() {
    console.log('completed!');
    //process.exit();
});

stream.on('error', function(err) {
    console.trace(err);
});

