/**
 * Parses the given input string into words, eliminating spaces and other special characters
 * @param inputString - raw string
 *
 * todo: handle apostrophe, and period-separated acronyms
 */
const splitIntoWords = (inputString) => {
    if(!inputString) {
        return [];
    }
    let words = inputString.match(/\w+|[\w]+/g);

    return words;
};

module.exports = { splitIntoWords };