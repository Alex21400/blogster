const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const requireLogin = require('../middlewares/requireLogin');
const keys = require('../config/keys');

const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey
});

module.exports = app => {
    app.get('/api/upload', requireLogin, (req, res) => {
        // generate file name with user id acting as a folder and uuid as a file name + jpeg extension
        const key = `${req.user.id}/${uuid()}.jpeg`;

        s3.getSignedUrl('putObject', {
            Bucket: 'blogster-bucket',
            ContentType: 'jpeg',
            Key: key
        }, (error, url) => res.send({ url, key }));
    });
}