const User = require('./user.model');
const utils = require('../../helpers/utils');
module.exports = {
    newUser: (req, res) => {
        utils.isEmailExist(req.body.email)
        .then(isEmailExist => {
            if (isEmailExist) {
                res.status(500).json({error: {code: 'ER_DUP_ENTRY', message: 'Email Already Exist'}});
            } else {
                let data = {
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                };
                let newUser = new User(data);
                newUser.save((err, userInfo) => {
                    if (err) {
                        return res.json(err);
                    } else {
                        return res.json({'status': 201, 'userInfo': userInfo});
                    }
                });
            }
        })
        .catch(err => {
            return res.json(err);
        });
    },
    getUserDetail: function(req, res) {
        let userId = req.decoded.id;
        utils.getUserDetail(userId).then(userDetails => {
            if (Object.keys(userDetails).length) {
                return res.status(200).json({
                success: true,
                message: 'successfully fetched',
                userDetails
            });
            } else {
                return res.status(401).json('Not Authorized')
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({err});
        })

    },

    updateUserById : async function (req, res) {
        let userId = req.decoded.id;
        if (req.body.isEmailChanged) {
            let isEmailExist = await utils.isEmailExist(req.body.email);
            if (isEmailExist) {
                res.status(500).json({error: {'code': 'ER_DUP_ENTRY'}});
            } else {
                utils.updateUserById(userId, req.body).then(details => {
                return res.status(201).json({
                    success: true,
                    message: 'successfully updated',
                    details
                })
                }).catch(err => {
                    res.status(500).json({error: err.code === 'ER_DUP_ENTRY'? {'code': 'ER_DUP_ENTRY'} : err});
                })
            }
        } else {
            utils.updateUserById(userId, req.body).then(details => {
            return res.status(201).json({
                success: true,
                message: 'successfully updated',
                details
            })
            }).catch(err => {
                res.status(500).json({error: err.code === 'ER_DUP_ENTRY'? 'Email Address Already Exist' : err});
            })
        }
    },

    updatePassword: function(req, res) {
        const userId = req.body.user.id;
        console.log('updating password');
        const confirmPassword = req.body.confirmPassword;
        utils.updatePassword(userId, confirmPassword).then(() => {
            return res.status(201).json({
                success: true,
                message: 'successfully changed password'
            })
        })
        .catch(err => {
            res.status(500).json({err})
        })
    }
}