var mongoose = require('../config/mongoose').instance();
var _ = require('lodash');
var apiOptions = require('../config/options');

var AcceptanceTest = mongoose.model('AcceptanceTest');

exports.find = function(req, res, next, id) {
    AcceptanceTest
        .findById(id)
        .populate('user', '-password')
        .populate('lastExecution', '-acceptanceTest')
        .exec(function(err, acceptanceTest) {
            if (err) return next(err);
            if (!acceptanceTest) return res.sendStatus(404);
            req.acceptanceTest = acceptanceTest;
            next();
        });
};

function list(query, req, res, next) {
    if (req.query.keyword) {
        var keywords = _.isArray(req.query.keyword) ? req.query.keyword : [req.query.keyword];
        query.where('keywords').all(keywords);
    }

    return query
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
}

exports.list = function (req, res, next) {
    var query = AcceptanceTest.find();

    query.populate('user', '-password -isAdmin -email')
         .where('state').in(req.query.state ? _.flatten([req.query.state]) : ['validated', 'pending'])
         .where(_.pick(req.query, 'priority', 'user'));

    return list(query, req, res, next);
};

exports.listPublic = function (req, res, next) {
    var query = AcceptanceTest.find();

    query.select('-rejectionMessage -state -user -priority')
         .where('state', 'validated');

    return list(query, req, res, next);
};

exports.create = function (req, res, next) {
    var attributes = req.body;

    attributes.user = req.user._id;

    AcceptanceTest.createNew(attributes, function (err, acceptanceTest) {
        if (err) return next(err);
        res.send(acceptanceTest);
    });
};

exports.createPublic = function (req, res, next) {
    var attributes = req.body;

    delete attributes.priority;
    attributes.state = 'unclaimed';

    AcceptanceTest.createNew(attributes, function (err, acceptanceTest) {
        if (err) return next(err);
        res.send(acceptanceTest);
    });
};

exports.show = function (req, res) {
    res.send(req.acceptanceTest);
};

exports.update = function (req, res, next) {
    var expectedResults = _.map(req.body.expectedResults, function (expectedResult) {
        return _.pick(expectedResult, 'code', 'expectedValue');
    });

    if (req.acceptanceTest.state === 'unclaimed') {
        req.acceptanceTest.set('state', 'pending');
        req.acceptanceTest.set('user', req.user._id);
    }

    req.acceptanceTest
        .set('expectedResults', expectedResults)
        .set(_.pick(req.body, 'name', 'description', 'keywords'));

    if (req.user.isAdmin) {
        req.acceptanceTest.set(_.pick(req.body, 'priority'));
    }

    req.acceptanceTest.saveUpdate(req.user, function(err) {
        if (err) return next(err);
        res.send(req.acceptanceTest);
    });
};

exports.delete = function (req, res, next) {
    req.acceptanceTest.removeAll(function(err) {
        if (err) return next(err);
        res.sendStatus(204);
    });
};

exports.updateValidation = function (req, res, next) {
    req.acceptanceTest.updateValidationState(req.body.state, req.user, req.body.rejectionMessage, function(err) {
        if (err) return next(err);
        res.sendStatus(200);
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

exports.simulate = function (req, res, next) {
    req.acceptanceTest.simulate(function(err, result) {
        if (err) return next(err);
        res.send(result);
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

exports.possibleValues = function(req, res) {
    res.status(200).json(apiOptions.possibleValues);
};

