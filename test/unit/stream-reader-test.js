const { Readable}  = require('stream');
const streamReader = require('../../lib/business-logic/helpers/stream-reader');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const { expect } = chai;


describe ('stream-reader', () => {
    describe ('consumeStream', () => {

        const { consumeStream } = streamReader;

        let sandbox = sinon.createSandbox();
        beforeEach('setup sandbox', () => {
        });

        afterEach('restore sandbox', () => {
            sandbox.restore();
        });

        it ('consumes a stream in chunks and processes each chunk separately', async () => {
            const stringChunk = 'this is a string to be processed';
            const stringArr = [stringChunk, stringChunk, stringChunk]

            const readStream = Readable.from(stringArr);

            // add a method to process the string, with a spy to make sure it is called.
            let processedString = '';
            const handleChunkSpy = sandbox.spy((data) => {
                processedString = processedString + data;
            });

            // Process the stream
            await consumeStream(readStream, handleChunkSpy);

            // Make sure that the stream was read and processed
            expect(handleChunkSpy).called;

            // eventually we want to see that the whole string was read successfully.
            expect(processedString).to.eq(stringArr.join(''));
        });

        it('Carries the last word of each chunk to be processed with the next chunk, to make sure no words are not broken.', async() => {

            const stringArr = [
                'The words in string are intentionally bro',    // break in the middle of the word, 'broken' should be the first word in the next chunk
                'ken in the middle to make sure ',              // last char is a space. no carry
                'that the stream is c',                         // 'consumed' should be the first word in the next chunk
                'onsumed correctly, and',                       // 'and' is moved to the next chunk
                ' words remain intact.',                        // stats with a space. 'and' from the previous chunk will be a separate word. 'intact.' will be processed seprarately.
            ];

            const readStream = Readable.from(stringArr);

            let processedString = '';
            const handleChunkSpy = sandbox.spy((data) => {
                processedString = processedString + data;
            });

            // Process the stream
            await consumeStream(readStream, handleChunkSpy);

            const spyCalls = handleChunkSpy.getCalls();

            // expect 4 chunks, plus the last carry
            expect(spyCalls.length).to.eq(stringArr.length + 1);

            // make sure we got the correct string processed each time
            expect(spyCalls[0].firstArg).to.eq('The words in string are intentionally ');
            expect(spyCalls[1].firstArg).to.eq('broken in the middle to make sure ');
            expect(spyCalls[2].firstArg).to.eq('that the stream is ');
            expect(spyCalls[3].firstArg).to.eq('consumed correctly, ');
            expect(spyCalls[4].firstArg).to.eq('and words remain ');
            expect(spyCalls[5].firstArg).to.eq('intact.');

            expect(processedString).to.eq(stringArr.join(''));
        });
    });
});
