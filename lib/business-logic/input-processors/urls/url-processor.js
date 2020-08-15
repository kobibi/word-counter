var http = require('http');
const { URL } = require('url');
const axios = require('axios');
const stringProcessor = require('../strings/string-processor');
const { streamReader: { consumeStream } } = require('../../helpers');


const _splitUrl = (urlString) => {
    const urlObject = new URL(urlString);
    const { host, port, path = '/'} = urlObject;
    return { host, port, path };
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

        const response = await axios.request({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

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