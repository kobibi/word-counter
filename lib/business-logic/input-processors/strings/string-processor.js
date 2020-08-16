const { wordCountMapper } = require('../../helpers');
const { wordCountRepository } = require('../../../repositories');


const processString = async (string) => {
    const resultWordMap = wordCountMapper.mapContainedWords(string);

    await wordCountRepository.saveWordCountMap(resultWordMap);
};

const validateStringInput = async (string) => {
    return [];
};

module.exports = { processString, validateStringInput };