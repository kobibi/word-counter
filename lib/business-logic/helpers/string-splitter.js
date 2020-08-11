/**
 * Parses the given input string into words, eliminating spaces and other special characters
 * @param inputString - raw string
 * @returns an array the words of which the input string is comprised of, without any whitespaces, special characters,
 * or any other separators
 *
 * todo: handle apostrophe, and period-separated acronyms
 */
const splitIntoWords = (inputString) => {
    if(!inputString) {
        return [];
    }

    if (typeof inputString !== 'string') {
        return [];
    }

    let words = inputString.match(/\w+|[\w]+/g);

    return words;
};

module.exports = { splitIntoWords };