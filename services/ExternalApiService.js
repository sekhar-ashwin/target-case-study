const request = require('request');

const makeApiCall = (url) => {
    return new Promise((resolve, reject) => {
        request(url, { json: true }, (err, res, body) => {
            if (err)
                return reject(err);
            
            return resolve(body);
        });
    });
}

const externalApiService = module.exports = { makeApiCall };