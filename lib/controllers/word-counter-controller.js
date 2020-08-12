const express = require('express');
const router = express.Router();

const wordCounterBL = require('../business-logic/word-counter-logic');
const { processString } = wordCounterBL;

router.get('/word-counter', async function(req, res){
    try {
        const {query} = req;

        let inputType;

        if (query.string) {
            inputType = 'string';
        }
        else if (query.file) {
            inputType = 'file';
            res.json({success: true});
        }
        else if (query.url) {
            inputType = 'url';
            res.json({success: true});
        }
        else {
            res.status(422);
            res.json({success: false, message: "Request must specify a valid form of input"});
            return;
        }

        await processString(query.string, inputType);
        res.json({success: true});
    }
    catch (err) {
        console.log(`Error while processing Word Counter request.\nQueryString: ${JSON.stringify(req.query)}`);
        console.error(err);
        res.status(500);
        res.send({success: false, message: "An error occurred while processing your request. Please try again later."})
    }
});

router.get('/word-statistics', function(req, res){
    res.send("word counter!");
});

module.exports = router;