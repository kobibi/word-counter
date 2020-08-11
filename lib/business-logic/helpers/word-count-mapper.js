const { splitIntoWords } = require('./string-splitter');

/**
 * Returns a case-insensitive dictionary of each word in the input string, and the number of times it appears in the input string.
 * @param inputString - any string value. non-string values will return an empty map.
 * @returns a dictionary, where the keys are the words in the input string, and the values are the number of times each word appears in the string
 */
const mapContainedWords = (inputString) => {
    const wordsInInputString = splitIntoWords(inputString) || [];  // trust no one!

    const wordMap = {};

    // If the array of words is empty, the function will return an empty map.
    wordsInInputString.forEach((word) => {
        // switch to lowercase to make sure the count is case insensitive
        const lowercaseWord = word.toLowerCase();

        if(!wordMap[lowercaseWord]) {
            wordMap[lowercaseWord] = 1;
        }
        else {
            wordMap[lowercaseWord]++;
        }
    });

    return wordMap
};

module.exports = {mapContainedWords};