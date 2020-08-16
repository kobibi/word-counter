const http = require('http');
const https = require('https');
const { wordCountRepository}  = require('../../../../lib/repositories');
const { urlProcessor } = require('../../../../lib/business-logic/input-processors');

const { Writable, Readable}  = require('stream');
const streamReader = require('../../../../lib/business-logic/helpers/stream-reader');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const { expect } = chai;

describe ('url-processor', () => {

    let sandbox = sinon.createSandbox();

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });


    /**
     * Strategy:
     * - stub the http request
     * - stub the repository
     * - test only the logic
     */
    describe ('processUrl', () => {
        it('uses the http protocol when specified in the url', async () => {
            const mockStream = Readable.from([]);
            mockStream.statusCode = 200;  // a poor man's Response mock

            // create stubs:
            const httpRequestStub = sandbox.stub(http, 'get').callsFake((config, callback) => {
                callback(mockStream);
            });
            const httpsRequestStub = sandbox.stub(https, 'get').callsFake((config, callback) => {
                callback(mockStream);
            });
            sandbox.stub(wordCountRepository, 'saveWordCountMap').returns(Promise.resolve());

            await urlProcessor.processUrl('http://www.someurl.com');

            expect(httpRequestStub.getCalls().length).eq(1);
            expect(httpsRequestStub.getCalls().length).eq(0);
        });

        it('uses the https protocol when specified in the url', async () => {
            const mockStream = Readable.from([]);
            mockStream.statusCode = 200;  // a poor man's Response mock

            // create stubs:
            const httpRequestStub = sandbox.stub(http, 'get').callsFake((config, callback) => {
                callback(mockStream);
            });
            const httpsRequestStub = sandbox.stub(https, 'get').callsFake((config, callback) => {
                callback(mockStream);
            });
            sandbox.stub(wordCountRepository, 'saveWordCountMap').returns(Promise.resolve());

            await urlProcessor.processUrl('https://www.someurl.com');

            expect(httpRequestStub.getCalls().length).eq(0);
            expect(httpsRequestStub.getCalls().length).eq(1);
        });

        it('uses the http protocol when not specified in the url', async () => {
            const mockStream = Readable.from([]);
            mockStream.statusCode = 200;  // a poor man's Response mock

            // create stubs:
            const httpRequestStub = sandbox.stub(http, 'get').callsFake((config, callback) => {
                callback(mockStream);
            });
            const httpsRequestStub = sandbox.stub(https, 'get').callsFake((config, callback) => {
                callback(mockStream);
            });
            sandbox.stub(wordCountRepository, 'saveWordCountMap').returns(Promise.resolve());

            await urlProcessor.processUrl('www.someurl.com');

            expect(httpRequestStub.getCalls().length).eq(1);
            expect(httpsRequestStub.getCalls().length).eq(0);
        });

        it('streams the url data and counts the words in it correctly', async () => {
            // Stub the http request stream:
            const stringArr = [
                'hi! my name is(what?), my name is(who?), my name is slim shady.',
                'hi! my name is(what?), my name is(who?), my name is slim shady.',
                'hi! my name is(what?), my name is(who?), my name is slim shady.',
                'hi! my name is(what?), my name is(who?), my name is slim shady.',
                'hi! my name is(what?), my name is(who?), my name is slim shady.'
            ];
            const readStream = Readable.from(stringArr);
            readStream.statusCode = 200;
            const httpRequestStub = sandbox.stub(http, 'get')
                .callsFake((config, callback) => {
                    callback(readStream)
                });

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
            const saveWordCountStub = sandbox.stub(wordCountRepository, 'saveWordCountMap')
                .callsFake(aggregateWordCount);

            // Call processFile:
            await urlProcessor.processUrl('www.someurl.com');

            // Assert expected results:

            // expect the method to send an http request
            expect(httpRequestStub).called;

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

        });

        it('handles cases when the data chunks break words in the middle.', async () => {

            // Stub the file stream, stir the pot a little:
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
            readStream.statusCode = 200;
            const httpRequestStub = sandbox.stub(http, 'get')
                .callsFake((config, callback) => {
                    callback(readStream)
                });

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

                // console.log(totalWordMap);
            };
            const saveWordCountStub = sandbox.stub(wordCountRepository, 'saveWordCountMap')
                .callsFake(aggregateWordCount);

            // Call processFile:
            await urlProcessor.processUrl('www.someurl.com');

            // Assert expected results:

            // expect the method to send an http request
            expect(httpRequestStub).called;

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

        });
    });
});
