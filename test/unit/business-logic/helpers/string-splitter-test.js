const { expect } = require('chai');

const stringSplitter  = require('../../../../lib/business-logic/helpers/string-splitter');

const expectResultToBeArray = (result) => {
    expect(Array.isArray(result)).to.be.true;
};

const expectArraysToBeEqual = (expectedArray, resultArray) => {
    expectResultToBeArray(resultArray);

    expect(resultArray.length).to.eq(expectedArray.length);

    for(let i = 0; i < resultArray.length; i++) {
        expect(resultArray[i]).to.eq(expectedArray[i]);
    }
};

describe('string-splitter', () => {

    describe ('splitIntoWords', () => {

        const { splitIntoWords } = stringSplitter;

        it('returns an empty array when receiving an empty string', () => {
            const result = splitIntoWords('');

            expectArraysToBeEqual([], result);
        });

        it('returns an empty array when receiving an empty null or undefined values', () => {
            let result;

            result = splitIntoWords(null);
            expectArraysToBeEqual([], result);

            result = splitIntoWords();
            expectArraysToBeEqual([], result);
        });

        it('returns an empty array when input string contains only special characters', () => {
            const inputString = '!@#$%^&()';

            const result = splitIntoWords('');

            expectArraysToBeEqual([], result);
        });

        it('returns an empty array when inputString param value is not a string', () => {
            let inputNonString;
            let result;

            inputNonString = 23;
            result = splitIntoWords(inputNonString);
            expectArraysToBeEqual([], result);

            inputNonString = [];
            result = splitIntoWords(inputNonString);
            expectArraysToBeEqual([], result);

            inputNonString = {};
            result = splitIntoWords(inputNonString);
            expectArraysToBeEqual([], result);

            inputNonString = () => {};
            result = splitIntoWords(inputNonString);
            expectArraysToBeEqual([], result);
        });

        it('return an array with a single word when the string contains a single word.', () => {
            const inputString = 'word';
            const expectedResult = ['word'];

            const result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);
        });

        it('ignores leading and trailing whitespaces when input string contains a single word.', () => {
            const inputString = '   \tword  \t ';
            const expectedResult = ['word'];

            const result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);
        });

        it('return an array with a single word when the string contains a single word and special characters.', () => {
            const inputString = '{[(word]?!)]},.~!@#$%^&*-=+|\\';
            const expectedResult = ['word'];

            const result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);
        });

        it('return a correct array with each word in the input string when the string contains multiple words separated by whitespaces', () => {
            const inputString = 'This is more than just one word';
            const expectedResult = ['This', 'is', 'more', 'than', 'just', 'one', 'word'];

            const result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);
        });

        it('return a correct array with each word in the input string when the string contains multiple words and special characters', () => {
            const inputString = '(This) is! more? [than] just, one !@#$%%^&*()-=+ word.';
            const expectedResult = ['This', 'is', 'more', 'than', 'just', 'one', 'word'];

            const result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);
        });

        it('regards recurring words in the input strings as separate words', () => {
            const inputString = 'Hello! hello! hello! lo lo o... Can anybody hear me? ear me? me? me?';
            const expectedResult = ['Hello', 'hello', 'hello', 'lo', 'lo', 'o', 'Can', 'anybody', 'hear', 'me', 'ear', 'me', 'me', 'me'];

            const result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);
        });

        it('regards all special characters as separators', () => {
            const inputString = 'My un-dead friend is b*witched';
            const expectedResult = ['My', 'un', 'dead', 'friend', 'is', 'b', 'witched'];

            const result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);
        });

        it('handles numbers as words', () => {
            let inputString;
            let expectedResult;
            let result;

            inputString = '1234';
            expectedResult = ['1234'];
            result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);

            inputString = '12-34=56?';
            expectedResult = ['12', '34', '56'];
            result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);
        });

        it('handles words with both numbers and letters in them', () => {
            let inputString;
            let expectedResult;
            let result;

            inputString = 'a123b4';
            expectedResult = ['a123b4'];
            result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);

            inputString = '1: a12-b34=56c? Yes';
            expectedResult = ['1', 'a12', 'b34', '56c', 'Yes'];
            result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);
        });

        it('regards underscore as a character in a word, and not as a separator', () => {
            let inputString;
            let expectedResult;
            let result;

            inputString = '_';
            expectedResult = ['_'];
            result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);

            inputString = '   _   ';
            expectedResult = ['_'];
            result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);

            inputString = '-_!';
            expectedResult = ['_'];
            result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);

            inputString = 'this is one_word!';
            expectedResult = ['this', 'is', 'one_word'];
            result = splitIntoWords(inputString);
            expectArraysToBeEqual(expectedResult, result);
        });

    });
});