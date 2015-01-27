var mongoose = require('../config/mongoose').instance();
var _ = require('lodash');

var AcceptanceTest = mongoose.model('AcceptanceTest');
var Situation = mongoose.model('Situation');

exports.find = function(req, res, next, id) {
    AcceptanceTest
        .findById(id)
        .populate('user', '-password')
        .populate('lastExecution', '-acceptanceTest')
        .exec(function(err, acceptanceTest) {
            if (err) return next(err);
            if (!acceptanceTest) return res.send(404);
            req.acceptanceTest = acceptanceTest;
            next();
        });
};

exports.list = function (req, res, next) {
    var query = AcceptanceTest.find();

    if (req.user) {
        query.populate('user', '-password -isAdmin -email');

        if (req.query.state) {
            var states = _.isArray(req.query.state) ? req.query.state : [req.query.state];
            query.where('state').in(states);
        } else {
            query.where('state').in(['validated', 'pending']);
        }

        if (req.query.priority) query.where('priority').equals(req.query.priority);
        if (req.query.user) query.where('user').equals(req.query.user);
    } else {
        query.select('-rejectionMessage -state -user -priority');
        query.where('state', 'validated');
    }

    if (req.query.keyword) {
        var keywords = _.isArray(req.query.keyword) ? req.query.keyword : [req.query.keyword];
        query.where('keywords').all(keywords);
    }

    query
        .populate('lastExecution', '-acceptanceTest')
        .exec(function(err, acceptanceTests) {
            if (err) return next(err);
            if (req.query.organization) {
                var organizations = _.isArray(req.query.organization) ? req.query.organization : [req.query.organization];
                acceptanceTests = _.filter(acceptanceTests, function(acceptanceTest) {
                  return acceptanceTest.user && _.contains(organizations, acceptanceTest.user.organization);
                });
            }
            res.send(acceptanceTests);
        });
};

exports.create = function (req, res, next) {
    Situation.findById(req.body.situation, function(err, situation) {
        if (err) return next(err);
        if (!situation) return res.status(400).end();

        var expectedResults = _.map(req.body.expectedResults, function (expectedResult) {
            return _.pick(expectedResult, 'code', 'expectedValue');
        });

        var acceptanceTest = new AcceptanceTest(_.pick(req.body, 'name', 'description', 'keywords'));

        acceptanceTest
            .set('user', req.user._id)
            .set('situation', situation._id)
            .set('expectedResults', expectedResults)
            .set('priority', 'normal')
            .set('state', 'pending')
            .set('_created', Date.now())
            .set('_updated', Date.now())
            .save(function (err) {
                if (err) return next(err);
                situation.set('status', 'test').save(function (err) {
                    if (err) return next(err);
                    res.send(acceptanceTest);
                });
            });
    });
};

exports.show = function (req, res) {
    res.send(req.acceptanceTest);
};

exports.update = function (req, res, next) {
    var expectedResults = _.map(req.body.expectedResults, function (expectedResult) {
        return _.pick(expectedResult, 'code', 'expectedValue');
    });

    req.acceptanceTest
        .set('_updated', Date.now())
        .set('expectedResults', expectedResults)
        .set(_.pick(req.body, 'name', 'description', 'keywords'));

    if (req.user.isAdmin) {
        req.acceptanceTest.set(_.pick(req.body, 'priority'));
    }

    req.acceptanceTest.saveUpdate(req.user, function(err) {
        if (err) return next(err);
        res.send(req.situation);
    });
};

exports.delete = function (req, res, next) {
    req.acceptanceTest.removeAll(function(err) {
        if (err) return next(err);
        res.send(204);
    });
};

exports.updateValidation = function (req, res, next) {
    req.acceptanceTest.updateValidationState(req.body.state, req.user, req.body.rejectionMessage, function(err) {
        if (err) return next(err);
        res.send(200);
    });
};

exports.showTimeline = function (req, res, next) {
    req.acceptanceTest.timeline(function (err, activities) {
        if (err) return next(err);
        res.send(activities);
    });
};

exports.showKeywords = function (req, res, next) {
    AcceptanceTest.distinct('keywords', function (err, keywords) {
        if (err) return next(err);
        res.send(keywords);
    });
};

exports.showOrganizations = function (req, res) {
    var organizations = {};

    AcceptanceTest
        .find()
        .select('user')
        .populate('user', 'organization')
        .stream()
        .on('data', function (acceptanceTest) {
            if (acceptanceTest.user && acceptanceTest.user.organization) {
                organizations[acceptanceTest.user.organization] = true;
            }
        })
        .on('end', function () {
            res.send(_.keys(organizations));
        });
};
