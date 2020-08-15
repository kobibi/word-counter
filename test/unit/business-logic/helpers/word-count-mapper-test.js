const chai = require('chai');
const { expect } = chai;

const wordMapper = require('../../../../lib/business-logic/helpers/word-count-mapper');

const expectMapsToBeEqual = (expectedMap, resultMap) => {
    // make sure resultMap is an object
    expect(typeof resultMap).to.eq('object');

    // make sure resultMap has the same number of keys as expectedMap
    expect(Object.keys(resultMap).length).to.eq(Object.keys(expectedMap).length);

    // make sure all keys in expectedMap appear in resultMap, with the same values;
    Object.keys(expectedMap).forEach((expectedKey) => {
        if(expectedMap.hasOwnProperty(expectedKey)) {
            expect(resultMap.hasOwnProperty(expectedKey)).to.eq(true);

            const expectedValue = expectedMap[expectedKey];
            expect(resultMap[expectedKey]).to.eq(expectedValue);
        }
    });
};

describe ('word-count-mapper', () => {
    describe ('mapContainedWords', () => {

        const { mapContainedWords } = wordMapper;

        it('returns an empty map when inputString is an empty string, null, or undefined', () => {
            const emptyStrings = ['', null, undefined];

            emptyStrings.forEach((emptyString) => {
                const result = mapContainedWords(emptyString);
                expectMapsToBeEqual({}, result);
            });
        });
        it('returns an empty map when inputString is not a string', () => {
            const nonStrings = [34, [], {}, () => {}];

            nonStrings.forEach((nonString) => {
                const result = mapContainedWords(nonString);
                expectMapsToBeEqual({}, result);
            });

        });
        it('returns a map of words in the input string and the number of times they appear in it', () => {
            const inputString = 'hi! my name is(what?), my name is(who?), my name is slim shady';
            const expectedResult = {
                'hi': 1,
                'my': 3,
                'name': 3,
                'is': 3,
                'what': 1,
                'who': 1,
                'slim': 1,
                'shady': 1
            };

            const result = mapContainedWords(inputString);
            expectMapsToBeEqual(expectedResult, result);
        });
        it('returns with all all the words in the map in lowercase', () => {
            const inputString = 'Hi! My name is(what?), my name is(who?), my name is Slim Shady';
            const expectedResult = {
                'hi': 1,
                'my': 3,
                'name': 3,
                'is': 3,
                'what': 1,
                'who': 1,
                'slim': 1,
                'shady': 1
            };

            const result = mapContainedWords(inputString);
            expectMapsToBeEqual(expectedResult, result);
        });

    });
});