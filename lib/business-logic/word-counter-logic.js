

const countWordsInString = (string) => {
    return {
        success: true
    };
};

const countWordsInFile = (fileUrl) => {
    return {
        success: true
    };
};

const countWordsInDataUrl = (url) => {
    return {
        success: true
    };
};


const processString = (input, inputType) => {
    switch(inputType) {
        case 'string':
            return countWordsInString(input);
        case 'file':
            return countWordsInFile(input);
        case 'url':
            return countWordsInDataUrl(input);
        default:
            return {};
    }
};

module.exports = {processString};