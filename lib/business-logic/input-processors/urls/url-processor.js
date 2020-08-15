const http = require('http');
const https = require('https');

const url = require('url');
const stringProcessor = require('../strings/string-processor');
const { streamReader: { consumeStream } } = require('../../helpers');


/**
 * Promisify the http(s).get method.
 * Validate and determine protocol before sending request via the correct dispatcher.
 */
const _dispatchRequest = async(urlString) => {
    return new Promise((resolve, reject) => {

        // validate protocol exists, or set default
        if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
            urlString = 'http://' + urlString;
        }

        const urlObj = url.parse(urlString);

        const {hostname: host, port, path} = urlObj;

        const headers = {accept: 'text/plain'}; // accept only textual content

        const config = {host, port, path, headers};

        const requestDispatcher = (urlObj.protocol === 'http:') ? http : https;
        requestDispatcher.get(config, (response) => {
            if (response.statusCode != 200) {
                reject('Could not read data from given url');
            }

            resolve(response);
        })
            .on('error', (err) => {
                reject(err);
            });
    });
};


/**
 * Process the data served by the given url by
 * 1. establishing data stream to read from the source
 * 2. using streamReader to consume the streadm
 * 3. Use the stringProcessor to handle each chunk of string from the stream.
 *
 * @param url
 * @returns {Promise<void>}
 */
const processUrl = async (url) => {
    try {
        // http.get({host: 'localhost', port: 8200, path: '/'}, (res) => {

        const response = await _dispatchRequest(url);

        await consumeStream(response, (data) => {
            stringProcessor.processString(data);
        });

    } catch (err) {
        console.error(err);
    }
};



const validateUrlInput = async (url) => {
    return [];
};

module.exports = { validateUrlInput, processUrl };