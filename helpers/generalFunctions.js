const File = require('../api/file/file.model');
const User = require('../api/user/user.model');

class GeneralFunctions {
    saveFileSchema(fileData) {
        return new Promise(async (resolve, reject) => {
            try {
                let file = await new File(fileData).save();
                let user = await User.findById(file.user).exec();
                user.files.push(file);
                user.save();
                resolve(true);
            } catch(e) {
                console.log('unable to insert file data', e);
                reject(e);
            }
        })
    }
}

const generalFunctions = new GeneralFunctions();
module.exports = generalFunctions;