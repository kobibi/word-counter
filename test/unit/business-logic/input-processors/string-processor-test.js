const { wordCountRepository}  = require('../../../../lib/repositories');
const { stringProcessor } = require('../../../../lib/business-logic/input-processors');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const { expect } = chai;

describe ('string-processor', () => {

    /**
     * Strategy:
     * - stub the repository
     * - test only the business logic
     */
    describe('processString', () => {

        let sandbox = sinon.createSandbox();

        afterEach('restore sandbox', () => {
            sandbox.restore();
        });

        it('calculates the correct word count and saves it', async () => {

            const saveWordCountStub = sandbox.stub(wordCountRepository, 'saveWordCountMap')
                .callsFake(async () => {
                });

            const testString = 'hi! my name is(what?), my name is(who?), my name is slim shady.';

            stringProcessor.processString(testString);

            expect(saveWordCountStub).calledOnce;

            const expectedWordCount = {
                'hi': 1,
                'my': 3,
                'name': 3,
                'is': 3,
                'what': 1,
                'who': 1,
                'slim': 1,
                'shady': 1
            };

            expect(saveWordCountStub.firstCall.firstArg).to.deep.equal(expectedWordCount);
        });
    });
});
