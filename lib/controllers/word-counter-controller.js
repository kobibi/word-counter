const express = require('express');
const router = express.Router();

const wordCounterBL = require('../business-logic/word-counter-logic');
const { countWords } = wordCounterBL;

router.get('/word-counter', async function(req, res){
    try {
        const {query} = req;

        const result = await wordCounterBL.countWords(query.input, query.inputType);

        if (result.success) {
            res.json(result);
        }
        else {
            if(result.validationErrors) {
                res.status(422);
                res.json(result);
            }
        }
    }
    catch (err) {
        console.log(`Error while processing Word Counter request.\nQueryString: ${JSON.stringify(req.query)}`);
        console.error(err);

        res.status(500);
        res.json({success: false, message: "An error occurred while processing your request. Please try again later."})
    }
});

router.get('/word-statistics', function(req, res){
    res.send("word counter!");
});

module.exports = router;