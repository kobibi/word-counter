const fs = require('fs');
const readline = require('readline');

const stringProcessor = require('../strings/string-processor');

const processFile = async (filePath) => {
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        await stringProcessor.processString(line);
    }
};

/**
 * Validate the given file path. Check if such file exists on the server.
 * @param filePath
 * @returns {Promise<string[]|Array>}
 */
const validateFileInput = async (filePath) => {
    const fs = require('fs');

    try {
        if (fs.existsSync(filePath)) {
            return [];
        }
        return ['Incorrect input.']; // Security wise - you don't want to give out information as to which files exist on your machine...
    }
    catch(err) {
        console.error(err);
        return ['Unable to validate input.'];
    }
};

module.exports = { validateFileInput, processFile };


