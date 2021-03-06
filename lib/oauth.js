var passport = require('passport');
var express = require('express');
var util = require('util');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var tm = require('./tm');

// Add passport OAuth2 authorization.
util.inherits(Strategy, OAuth2Strategy);
function Strategy() {
    OAuth2Strategy.call(this, {
        authorizationURL: tm.config().mapboxauth + '/oauth/authorize',
        tokenURL:         tm.config().mapboxauth + '/oauth/access_token',
        clientID:         'tilemill',
        clientSecret:     'tilemill',
        callbackURL:      'http://localhost:3000/oauth/mapbox'
    },
    function(accessToken, refreshToken, profile, callback) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        return callback(null, profile);
    });
    this.name = 'mapbox';
    return this;
};
Strategy.prototype.userProfile = function(accessToken, done) {
    this._oauth2.get(tm.config().mapboxauth + '/oauth/user', accessToken, function (err, body) {
        // oauth2 lib seems to not handle errors in a way where
        // we can catch and handle them effectively. We attach them
        // to the profile object here for our own custom handling.
        if (err) {
            return done(null, { error:err });
        } else {
            return done(null, JSON.parse(body));
        }
    });
};
passport.use(new Strategy());
passport.serializeUser(function(obj, done) { done(null, obj); });
passport.deserializeUser(function(obj, done) { done(null, obj); });

var app = express();
app.use(passport.initialize());
app.use('/oauth/mapbox', function(req, res, next) {
    if (req.query.error === 'access_denied') {
        tm.db.rm('oauth');
        next(new Error('Access denied'));
    } else if (req.query.error === 'fail') {
        tm.db.rm('oauth');
        next(new Error('Authorization failed'));
    } else {
        next();
    }
});
app.use('/oauth/mapbox', passport.authenticate('mapbox', {
    session: false,
    failureRedirect: '/oauth/mapbox?error=fail'
}));
app.use('/oauth/mapbox', function(req, res) {
    // The user ID is *required* here. If it is not provided
    // (see error "handling" or lack thereof in Strategy#userProfile)
    // we basically treat it as an error condition.
    tm.db.set('oauth', {
        account: req.user.id ? req.user.id : '',
        accesstoken: req.user.id ? req.user.accessToken : ''
    });
    // @TODO how to know if above failed?
    res.set({'content-type':'text/html'});
    res.send(tm.templates.oauth({account:req.user.id}));
});
//app.use('/:oauth(oauth)/mapbox/fail', function(req, res) {
//    tm.db.rm('oauth');
//    next(new Error('Authorization failed'));
//});
// Log internal OAuth errors to the console and respond with the usual
// response body to end OAuth iframe authorization process.
app.use(function(err, req, res, next) {
    if (err.name !== 'InternalOAuthError') return next(err);
    console.error(err);
    res.redirect('/');
});

module.exports = app;
