const fs = require('fs');
const { wordCountRepository}  = require('../../../../lib/repositories');
const { fileProcessor } = require('../../../../lib/business-logic/input-processors');

const { Readable}  = require('stream');
const streamReader = require('../../../../lib/business-logic/helpers/stream-reader');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const { expect } = chai;


describe ('file-processor', () => {

    let sandbox = sinon.createSandbox();

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });


    /**
     * Strategy:
     * - stub the file stream
     * - stub the repository
     * - test only the logic
     */
    describe ('processFile', () => {

        it('streams the file data and counts the words in it correctly', async () => {

            try {

                // Stub the file stream:
                const stringArr = [
                    'hi! my name is(what?), my name is(who?), my name is slim shady.',
                    'hi! my name is(what?), my name is(who?), my name is slim shady.',
                    'hi! my name is(what?), my name is(who?), my name is slim shady.',
                    'hi! my name is(what?), my name is(who?), my name is slim shady.',
                    'hi! my name is(what?), my name is(who?), my name is slim shady.'
                ];

                const readStream = Readable.from(stringArr);
                const fsCreateReadStreamStub = sandbox.stub(fs, 'createReadStream')
                    .callsFake(() => readStream);

                // Stub the repository save function
                // create a stub function to aggregate all calls made to the repository to ake sure in the end
                // we got the correct result.
                const totalWordMap = {};
                const aggregateWordCount = async (wordMap) => {
                    Object.keys(wordMap).forEach((key) => {
                        if (wordMap.hasOwnProperty(key)) {
                            totalWordMap[key] = (totalWordMap[key] || 0) + wordMap[key];
                        }
                    });

                    console.log(totalWordMap);
                };
                const saveWordCountStub = sandbox.stub(wordCountRepository, 'saveWordCount')
                    .callsFake(aggregateWordCount);

                // Call processFile:
                await fileProcessor.processFile('somepath');

                // Assert expected results:

                // expect the method to open and read the file.
                expect(fsCreateReadStreamStub).called;

                const expectedWordCount = {
                    'hi': 5,
                    'my': 15,
                    'name': 15,
                    'is': 15,
                    'what': 5,
                    'who': 5,
                    'slim': 5,
                    'shady': 5
                };

                expect(totalWordMap).to.deep.equal(expectedWordCount);
            }
            catch (err) {
                console.error(err);
                chai.Assert.fail(err);
            }

        });

        it('handles cases when the data chunks break words in the middle.', async () => {

            try {

                // Stub the file stream:
                const stringArr = [
                    'hi! my name is(what?), my name is(who?), my name is slim sh',
                    'ady.hi! my name is(what?), my name is(who?), my n',
                    'ame is slim shady.hi! my name is(what?), my name is(who?), my name is slim ',
                    'shady.hi! my name is(what?), my name is(w',
                    'ho?), my name is slim shady.hi! my name is(what',
                     '?), my name is(who?), my name is slim sha',
                    'dy.'
                ];

                const readStream = Readable.from(stringArr);
                const fsCreateReadStreamStub = sandbox.stub(fs, 'createReadStream')
                    .callsFake(() => readStream);

                // Stub the repository save function
                // create a stub function to aggregate all calls made to the repository to ake sure in the end
                // we got the correct result.
                const totalWordMap = {};
                const aggregateWordCount = async (wordMap) => {
                    Object.keys(wordMap).forEach((key) => {
                        if (wordMap.hasOwnProperty(key)) {
                            totalWordMap[key] = (totalWordMap[key] || 0) + wordMap[key];
                        }
                    });

                    console.log(totalWordMap);
                };
                const saveWordCountStub = sandbox.stub(wordCountRepository, 'saveWordCount')
                    .callsFake(aggregateWordCount);

                // Call processFile:
                await fileProcessor.processFile('somepath');

                // Assert expected results:
                expect(fsCreateReadStreamStub).called;

                const expectedWordCount = {
                    'hi': 5,
                    'my': 15,
                    'name': 15,
                    'is': 15,
                    'what': 5,
                    'who': 5,
                    'slim': 5,
                    'shady': 5
                };

                expect(totalWordMap).to.deep.equal(expectedWordCount);
            }
            catch (err) {
                console.error(err);
                chai.Assert.fail(err);
            }

        });
    });
});
