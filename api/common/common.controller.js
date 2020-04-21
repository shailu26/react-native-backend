const utils = require("../../helpers/utils");
const crypto = require("crypto");
const ALGO = "sha256";
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const env = dotenv.config({
  path: require("find-config")("server/.env")
});
const fs = require('fs');
const genralFunctions = require('../../helpers/generalFunctions');

const s3 = new AWS.S3({
  accessKeyId: env.parsed.ACCESS_KEY,
  secretAccessKey: env.parsed.SECRET_KEY,
  region: env.S3REGION
});

const getSignedUrl = params => {
  return new Promise((resolve, reject) => {
    s3.getSignedUrl("putObject", params, function (err, url) {
      if (err) {
        reject(err);
      }
      resolve(url);
    });
  });
};

module.exports = {
  getPresignedUrl: async (req, res) => {
    req.body = req.body.data;
    if (
      req.body.bucketName &&
      req.body.bucketName.length &&
      req.body.files &&
      req.body.files.length &&
      req.body.folderName &&
      req.body.userId
    ) {
      const dataToSend = [];
      for (let file of req.body.files) {
        let fileName = `${new Date().getTime()}_${req.body.userId}`;
        const hash = crypto
          .createHash(ALGO)
          .update(`${fileName}`, "utf-8")
          .digest("hex");
        const params = {
          Bucket: req.body.bucketName,
          Key: `${req.body.folderName}/${req.body.userId}/${hash}`,
          Expires: 6000,
          ContentType: file.contentType,
          ACL: "public-read"
        };

        try {
          let signedUrl = await getSignedUrl(params);
          let data = JSON.parse(JSON.stringify(file));
          data.url = signedUrl;
          data.hash = hash;
          data.fileName = fileName;
          dataToSend.push(data);
        } catch (error) {
          res.status(500).json({
            error
          });
        }
      }
      res.status(200).send(dataToSend);
    } else {
      res.status(422).json({
        error: "Check if any of these key is missing while passing to this api [bucketName, files(As Array) folderName, userId]"
      });
    }
  },
  uploadVideo: (req, res) => {
    const file = req.file;
    const otherDetails = JSON.parse(req.body.otherDetails);
    const readStream = fs.createReadStream(file.path)
    let globalVarKey = `uploadRequest_${otherDetails.userId}_${otherDetails.id}`;
    const s3params = {
      Bucket: `${otherDetails.bucketName}/${otherDetails.folderName}/${otherDetails.userId}`,
      Key: `${file.originalname}.${otherDetails.contentType}`,
      Body: readStream,
      ContentType: file.mimetype,
      ACL: "public-read"
    };

    let s3Request = s3.putObject(s3params, async function (err, data) {
        console.log({
          err,
          data
        });
        const params = this.request.params;
        const region = this.request.httpRequest.region;
        fs.unlink(file.path, function (err) {
          if (err) {
            console.error(err);
          }
        });
        delete global[globalVarKey];
        if (!err) {
          let s3Url = 'https://s3-' + region + '.amazonaws.com/' + params.Bucket + '/' + params.Key;
          console.log('https://s3-' + region + '.amazonaws.com/' + params.Bucket + '/' + params.Key);
          let file = await genralFunctions.saveFileSchema({
            fileName: file.originalname,
            s3Url,
            user: otherDetails.userId
          })
          console.log('file schema saved', file);
        } else {
          otherDetails.isVideoFailed = true;
          req.app.get('socket').emit(`uploadStatusSuccess_${1}`, otherDetails)
        }
      })
      .on('httpUploadProgress', (progress) => {
        console.log(Math.round(progress.loaded / progress.total * 100) + '% done', otherDetails);
        let percentageDone = Math.round(progress.loaded / progress.total * 100);
        otherDetails.percentageDone = percentageDone;
        otherDetails.isProgressStart = true;
        req.app.get('socket').emit(`uploadStatusSuccess_${1}`, otherDetails)
      });
    // setting request to global object so when user want to abort upload then he/she can abort it
    global[globalVarKey] = s3Request;
    res.json({
      success: true
    });
  },

  abortVideoUpload: (req, res) => {
    let globalVarKey = `uploadRequest_${req.body.userId}_${req.body.id}`;
    if (global[globalVarKey]) {
      // aborting request
      global[globalVarKey].abort();
      res.json({
        value: true
      });
    } else {
      res.json({
        value: false
      });
    }
  }
};