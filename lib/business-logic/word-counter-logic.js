const wordCountMapper = require('./helpers/word-count-mapper');

const wordCountRepository = require('../repositories/word-count-repository');

const countWordsInString = (string) => {
    const resultWordMap = wordCountMapper.mapContainedWords(string);

    wordCountRepository.saveWordCount(resultWordMap);
};

const countWordsInFile = (fileUrl) => {
};

const countWordsInDataUrl = (url) => {
};

const validateInput = async (input, inputType) => {
    return [];
};


const processString = async (input, inputType) => {
    // Validation is synchronous, since we want to notify the user immediately if there is a problem.
    const validationErrors = await validateInput(input, inputType);
    if (validationErrors.length > 1) {
        throw new Error (validationErrors[0]);
    }

    // String processing is asyncronous. We do not wait for the result.
    switch(inputType) {
        case 'string':
            countWordsInString(input);
            break;
        case 'file':
            countWordsInFile(input);
            break;
        case 'url':
            countWordsInDataUrl(input);
    }
};

module.exports = {processString};