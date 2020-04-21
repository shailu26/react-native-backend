const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FileSchema = new Schema({
    fileName: { type: String, required: true},
    s3Url: { type: String, default: null, required: true},
    user: {type: Schema.ObjectId, ref: 'User', index: true},
});

module.exports = mongoose.model('File', FileSchema);