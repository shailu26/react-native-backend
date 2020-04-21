const express = require('express')
const app = express();
const cors = require('cors');
const morgan = require('morgan')
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const init = require('./routes/routes').init;
const passport = require('passport');
 
app.use(cookieParser());
app.use(cors(), function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
  });

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({ 
    extended: false, 
    parameterLimit: 100000,
    limit: '100mb', }));

// session related task & passport intiallization...
app.use(session({ secret: 'appveil7867'}));
app.use(passport.initialize());
app.use(passport.session());
 
// Passport session setup, Passport needs to serialize and deserialize user instances from a session store to support login sessions. 
passport.serializeUser(function(user, done) {
done(null, user);
});
 
passport.deserializeUser(function(obj, done) {
done(null, obj);
});
 
 
// calling routes
init(app);


app.get('/hello', (req, res) => {
    res.send('Hello');
});

module.exports = app