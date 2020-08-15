const { fileProcessor, urlProcessor, stringProcessor } = require('./input-processors');

/**
 * Validates the given input before processing it
 * Function is asynchronous since validating urls and files is an involves I/O actions.
 *
 * @param input - the input itself
 * @param inputType - the type of the input
 * @returns A Promise of an array of possible errors. If the input is valid - an empty array is 'promised'.
 */
const validateInput = async (input, inputType) => {
    if(!input) {
        return ['Input value is missing'];
    }

    // if inputType is not specified, regard the input as a plain string.
    if(!inputType) {
        return stringProcessor.validateStringInput(input);
    }

    switch(inputType) {
        case 'file':
            return fileProcessor.validateFileInput(input);
        case 'url':
            return urlProcessor.validateUrlInput(input);
        case 'string':
            return stringProcessor.validateStringInput(input);
        default:
            return ['Given input type is incorrect'];
    }
};

/**
 * Process the given input, according to its types
 * The processing itself is asynchronous (at the very least we have to save the results).
 * However, the function itself is not declared as asynchronous, because it does not attempt to follow up
 * on the results of the async methods it calls.
 *
 * @param input - the input itself
 * @param inputType - the type of the input
 * @returns A Promise of an array of possible errors. If the input is valid - an empty array is 'promised'.
 */
const processInput = (input, inputType) => {
    switch(inputType) {
        case 'file':
            fileProcessor.processFile(input);
            break;
        case 'url':
            urlProcessor.processUrl(input);
            break;
        case 'string':
            stringProcessor.processString(input); // I prefer to be explicit, hance the duplicate call to processString
            break;
        default:
            stringProcessor.processString(input);

    }
};


/**
 * The main logic of processing a word count request.
 * Each type of input is handled by a different method.
 *
 * @Note: The reason the input validation is done collectively, and separate from the input processing, is that the validation
 * must be synchronous - so we can notify the user immediately, while the actual processing is asynchronous, since it
 * could take a long time.
 *
 * @param input - a string representing the input
 * @param inputType - a string representying the types of input we support - 'string', 'file', or 'url'
 * @returns A Promise of a 'result' object.
 */
const countWords = async (input, inputType) => {
    // Validation is synchronous, so we use 'await'
    const validationErrors = await validateInput(input, inputType);

    if(validationErrors.length > 0) {
        console.error(validationErrors);

        return {
            success: false,
            validationErrors
        };
    }

    // String processing is asynchronous, but we do not wait for the result.
    processInput(input, inputType);

    return {success: true};
};

module.exports = { countWords };