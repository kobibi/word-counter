const express = require('express');
const router = express.Router();

const wordCounterBL = require('../business-logic/word-counter-logic');
const { countWords } = wordCounterBL;

/**
 * Set the proper http code to the response (Default i 200) and serialize the result
 * @param blResult
 * @param response
 * @private
 */
const _prepareResponse = (blResult, response) => {
    if (blResult.success) {
        response.json(blResult);
        return;
    }

    if (blResult.validationErrors) {
        response.status(422);           // Bad input (unprocessable entity)
        response.json(blResult);
        return;
    }

    response.status(500);           // Server error
    response.json(blResult);
};

router.get('/word-counter', async (req, res) => {
    try {
        const {query} = req;

        const blResult = await wordCounterBL.countWords(query.input, query.inputType);

        _prepareResponse(blResult, res);
    }
    catch (err) {
        console.log(`Error while processing Word Counter request.\nQueryString: ${JSON.stringify(req.query)}`);
        console.error(err);

        res.status(500);
        res.json({success: false, message: "An error occurred while processing your request."})
    }
});

router.get('/word-statistics/:word', async (req, res) => {
    try {
        const blResult = await wordCounterBL.getWordCount(req.params.word);

        _prepareResponse(blResult, res);
    }
    catch (err) {
        console.log(`Error while processing Word Statistics request.\nWord: ${req.params.word} QueryString: ${JSON.stringify(req.query)}`);
        console.error(err);

        res.status(500);
        res.json({success: false, message: "An error occurred while processing your request."})
    }
});

/**
 * Check that all of the vital capablities in the service are up and runing. Otherwise - crash the server to allow restart
 */
router.get('/healthcheck', async (req, res) => {
    try {
        const hcResult = await wordCounterBL.healthCheck();
        res.json(hcResult);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
});


module.exports = router;