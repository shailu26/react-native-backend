const express = require('express');
const commonController = require('./common.controller');
const utils = require('../../helpers/utils');
const router = express.Router();
const multer = require('multer');
// Multer ships with storage engines DiskStorage and MemoryStorage
// And Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
var storage = multer.diskStorage({ // notice you are calling the multer.diskStorage() method here, not multer()
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        const otherDetails = JSON.parse(req.body.otherDetails);
        cb(null, file.fieldname + '-' + Date.now() + `.${otherDetails.contentType}`)
    }
});
var upload = multer({ storage: storage });


router.post('/getPresignedUrl', commonController.getPresignedUrl);
router.post('/uploadVideo', upload.single('file'), commonController.uploadVideo);
router.post('/abortVideoUpload', commonController.abortVideoUpload);

module.exports = router;