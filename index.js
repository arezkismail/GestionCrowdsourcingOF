var express = require('express');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var MongoStore = require('connect-mongo')(session);
var apiOptions = require('./lib/config/options');

module.exports = function (options) {
    options = options || {};
    var mongoose;

    if (options.mongoose) {
        mongoose = options.mongoose;
    } else {
        mongoose = require('mongoose');
        mongoose.connect(process.env.MONGODB_URL);
    }

    require('./lib/config/mongoose').init(mongoose);
    require('./lib/config/passport')(passport);

    if (process.env.NODE_ENV !== 'production') {
        require('./fixtures').loadFixtures({ mongoose: mongoose });
    }

    _.assign(apiOptions, _.pick(options, 'possibleValues', 'simulate', 'onCreate'));

    var app = express();

    app.use(bodyParser.json());
    app.use(cookieParser());

    // Persist sessions with mongoStore
    app.use(session({
        name: 'sid',
        secret: process.env.SESSION_SECRET || 'keyboard cat',
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        resave: true,
        saveUninitialized: true
    }));

    // Handle passport authentication
    app.use(passport.initialize());
    app.use(passport.session());

    var routesPath = path.join(__dirname, 'lib/routes');
    fs.readdirSync(routesPath).forEach(function (file) {
        if (/(.*)\.(js$|coffee$)/.test(file)) {
            require(routesPath + '/' + file)(app, passport);
        }
    });

    return app;

};
