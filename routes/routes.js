module.exports = { 
    'init': function (app) {
        // Insert routes below
        app.use('/api/user', require('../api/user'));
        app.use('/api/common', require('../api/common'));
    }
};