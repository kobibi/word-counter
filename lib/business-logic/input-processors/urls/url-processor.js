const fs = require('fs');
var http = require('http');
const { URL } = require('url');

const axios = require('axios').default;

const stringProcessor = require('../strings/string-processor');

const _splitUrl = (urlString) => {
    const urlObject = new URL(urlString);
    const { host, port, path = '/'} = urlObject;
    return { host, port, path };
};

const promisifiedHttpGet = function(url) {
    try {
        return new Promise((resolve, reject) => {
            try {
                http.get(_splitUrl(url), (res) => {
                    resolve(res);
                });
            }
            catch (err) {
                console.error (err);
                reject(err);
            }

        });
    }
    catch(err) {
        console.error(err);
    }
};

const _separateLastWordFromText = (string) => {
    const whitespaceIndex = string.lastIndexOf(' ');

    const lastWord = string.slice(whitespaceIndex + 1, string.length);
    const text = string.slice(0, whitespaceIndex);

    return {text, lastWord};
};


/**
 * Process the data served by the given url by:
 * 1. Read chunks of data from the response streadm
 * 2. Process each chunk of data as its own string, and save the results.
 *
 * Note:
 * We have no guarantee that a given does not end mid-word.
 * To overcome this, we will carry text that comes after the last whitespace,
 * and connect it to the beginning of the next chunk.
 * This way, if the last piece of text was part of a word, it will be processed along with the rest of the word in
 * the next event.
 * @param url
 * @returns {Promise<void>}
 */
const processUrl = async (url) => {
    try {
        let carry = '';
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        // return new Promise((resolve, reject) => {
        // http.get({host: 'localhost', port: 8200, path: '/'}, (res) => {
        response.on('data', (chunk) => {
            chunkString = '' + chunk;

            const {text, lastWord} = _separateLastWordFromText(chunkString);
            const textToProcess = carry + text;
            carry = lastWord;

            console.log(text);
            console.log(carry);
            stringProcessor.processString(textToProcess);
        });
        response.on('end', () => {
            console.log('end!');
            resolve();
        });

        response.on('error', (err) => {
            console.error(err);
            reject(err)
        });
    } catch (err) {
        console.error(err);
        reject(err);
    }
};

const validateUrlInput = async (url) => {
    return [];
};

module.exports = { validateUrlInput, processUrl };