const http = require('http');
const https = require('https');

const url = require('url');
const stringProcessor = require('../strings/string-processor');
const { streamReader: { consumeStream } } = require('../../helpers');

/**
 *     // validate protocol exists, or set default
 * @param urlString
 * @private
 */
const _fixProtocol = (urlString) => {
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
        urlString = 'http://' + urlString;
    }
    return urlString;
};

/**
 * Promisify the http(s).get method.
 * Validate and determine protocol before sending request via the correct dispatcher.
 */
const _dispatchRequest = async(urlString) => {
    return new Promise((resolve, reject) => {
        const urlObj = _parseUrl(urlString);

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
                console.error(err);
                reject();
            })
            .end();
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
        const response = await _dispatchRequest(url);

        await consumeStream(response, (data) => {
            stringProcessor.processString(data);
        });

    } catch (err) {
        console.error(err);
    }
};

// parse the string into a URL object
const _parseUrl = (urlString) => {
    const fixedUrlString = _fixProtocol(urlString);

    try {
        const urlObj = new url.URL(fixedUrlString);
        if (!(urlObj.hostname)) {
            return null;
        }
        return urlObj;
    } catch (err) {
        return null;
    }
};

/**
 * Send a 'head' request to the url to see that we get a valid response with the correct mime type
 * @param urlObj
 * @returns {Promise<any>}
 * @private
 */
const _validateEndpoint = (urlObj) => {
    return new Promise((resolve, reject) => {
        const {hostname: host, port, path} = urlObj;
        const headers = {accept: 'text/plain'};
        const config = {host, port, path, headers, method: 'head'};
        const requestDispatcher = (urlObj.protocol === 'http:') ? http : https;

        requestDispatcher.request(config, (response) => {
            if (response.statusCode != 200) {
                reject();
            }
            else if(response.headers['Content-type'] && response.headers['Content-type'] !== 'text/plain') {
                reject();
            }
            else {
                resolve(); // return an empty array
            }
        }).on('error', (err) => {
            console.error(err);
            reject();
        })
            .end();
    });

};


/**
 * Validate that the url constructed correctlym, and that the endpoint it represents is live and returns text using (HEAD request)
 *
 * @param url
 * @returns {Promise<*>}
 */
const validateUrlInput = async (urlString) => {
    const _urlObj = _parseUrl(urlString);
    if (!_urlObj) {
        return ['Input is not a valid URL string'];
    }

    try {
        await _validateEndpoint(_urlObj);
        return [];
    }
    catch (err) {
        console.error(err);
        return ['Input url is not a valid data endpoint.'];
    }
};

module.exports = { validateUrlInput, processUrl };