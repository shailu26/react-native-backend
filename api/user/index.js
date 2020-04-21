const express = require('express');
const userController = require('./user.controller');
const utils = require('../../helpers/utils');
const router = express.Router();

router.post('/login', utils.verifyLogin)
    .post('/createUser', utils.bycryptPassword, userController.newUser)
    .get('/getUserDetail', utils.validateToken, userController.getUserDetail)
    .patch('/updateUserById', utils.validateToken, userController.updateUserById)
    .post('/updatePassword', utils.verifyPassword, userController.updatePassword);

module.exports = router;