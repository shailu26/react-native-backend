
const User = require("../api/user/user.model");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv')
dotenv.config({path:__dirname+'/.env'});


function verifyAuth(req, res, next) {
    const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
    const options = {
        expiresIn: '2d',
    };
    try {
        // verify makes sure that the token hasn't expired
        let result = jwt.verify(token, process.env.JWT_SECRET, options);

        // Let's pass back the decoded token to the request object
        req.decoded = result;
        // We call next to pass execution to the subsequent middleware
        next();
    } catch (err) {
        res.status(500).send(err);
    }
}

function getUserByEmail(email) {
    console.log({email});
    return User.findOne({
        email
    }).exec();
}

module.exports = {
    validateToken: (req, res, next) => {
        const authorizationHeader = req.headers.authorization;
        let result;
        if (authorizationHeader) {
            verifyAuth(req, res, next);
        } else {
            result = {
                error: `Authentication error. Token required.`,
                status: 401
            };
            res.status(401).send(result);
        }
    },
    bycryptPassword: (req, res, next) => {
        const user = req.body;
        if (user.hasOwnProperty('password')) {
            bcrypt.hash(user.password, +process.env.saltingRounds, function (err, hash) {
                if (err) {
                    console.log('Error hashing password for user', user.name);
                    next(err);
                } else {
                    user.password = hash;
                    next();
                }
            });
        } else {
            next(new Error('Please provide password'))
        }
    },
    verifyLogin: (req, res) => {
        console.log(',,,,,', req.body);
        let result = {};
        let status = 200;
        const {
            email,
            password
        } = req.body;
        getUserByEmail(email)
            .then(user => {
                console.log({user});
                if (user && Object.keys(user).length) {
                    bcrypt.compare(password, user.password).then(match => {
                        if (match) {
                            status = 200;
                            // Create a token
                            const payload = {
                                email: user.email,
                                id: user._id,
                                name: user.name
                            };
                            const options = {
                                expiresIn: '2d'
                            };
                            const secret = process.env.JWT_SECRET;
                            const token = jwt.sign(payload, secret, options);

                            result.token = token;
                            result.status = status;
                            const {name, email, username, _id} = user;
                            result.result = {name, email, username, _id};
                        } else {
                            status = 401;
                            result.status = status;
                            result.errorMessage = 'Password does not match';
                        }
                        res.status(status).send(result);
                    }).catch(err => {
                        console.log({err});
                        status = 500;
                        result.status = status;
                        result.errorMessage = err;
                        res.status(status).send(result);
                    });
                } else {
                    status = 404;
                    result.status = status;
                    result.errorMessage = 'Email does not exist';
                    res.status(status).json(result);
                }
            })
            .catch(err => {
                status = 500;
                result.status = status;
                result.errorMessage = err;
                res.status(status).json(result);
            });
    },

    getLoggedinUserDetails: (req, res, next) => {
        const authorizationHeaader = req.headers.authorization;
        if (authorizationHeaader) {
            verifyAuth(req, res, next);
        } else {
            let result = {
                error: `Authentication error. Token required.`,
                status: 401
            };
            res.status(401).send(result);
        }
    },
    verifyPassword: (req, res, next) => {
        console.log('...ddasdasdsadsdsdsad');
        const email = req.body.email;
        const password = req.body.password;
        console.log({
            email,
            password
        });
        const error = {
            status: 500,
            statusText: ''
        }
        getUserByEmail(email)
            .then(user => {
                console.log(user, email);
                if (user && Object.keys(user).length) {
                    if (req.body.hasOwnProperty('confirmPassword') && req.body.confirmPassword.length) {
                        bcrypt.hash(req.body.confirmPassword, +process.env.saltingRounds, function (err, hash) {
                            if (err) {
                                console.log('Error hashing password for user', user.name);
                                next(err);
                            } else {
                                req.body.confirmPassword = hash;
                                req.body.user = user;
                                next();
                            }
                        });
                    } else {
                        error.statusText = 'Please provide confirm password';
                        res.status(500).send(error);
                    }

                } else {
                    res.status(404).send({
                        status: 404,
                        statusText: "Email not found"
                    });
                }
            })
            .catch(err => {
                res.status(500).send(err);
            });
    },
    getUserDetail: (_id) => {
        return User.findOne({
            _id
        }, {
            password: 0
        }).populate('payments').exec();
    },
    updateUserById: (userId, reqBody) => {
        return User.update({
            _id: userId
        }, reqBody).exec();
    },
    isEmailExist: (email) => {
        return new Promise((resolve, reject) => {
            getUserByEmail(email)
                .then(details => {
                    resolve(details && Object.keys(details).length);
                })
                .catch(err => {
                    reject(err);
                })
        })
    },
    updatePassword: (userId, password) => {
        return User.update({
            _id: userId
        }, {
            password
        }).exec();
    }
};