/**
 * Separates the last word ( = any text that comes after the last whitespace) in the given string, from the rest of it
 * @param string, supposedly containing multiple words
 * @returns {{lastWord: string, text: *}}
 * @private
 */
const _separateLastWordFromText = (string) => {
    const whitespaceIndex = string.lastIndexOf(' ');

    if(whitespaceIndex > 0) {
        const lastWord = string.slice(whitespaceIndex + 1, string.length);
        const text = string.slice(0, whitespaceIndex + 1);

        return {text, lastWord};
    }

    // if there's no whitespace in the string - return the full string as 'text'
    return {text: string, lastWord: ''};
};


/**
 * Reads chunks of data from the stream, while ensuring no words are 'broken' between chunks, and handles each string
 * with the given 'handleDataChunk' function.
 *
 * Note:
 * We have no guarantee that a given does not end mid-word.
 * To overcome this, we will carry text that comes after the last whitespace,
 * and connect it to the beginning of the next chunk.
 * This way, if the last piece of text was part of a word, it will be processed along with the rest of the word in
 * the next event.
 *
 * If at any point there is a problem with reading from the stream or processing it  - the stream reader stops reading,
 * and the return promise is rejected.
 *
 * @param readStream - a live stream to read from.
 * @param handleDataChunk - callback function to handle chunks of data given from the stream.
 * @returns {Promise<*>} - resolved if stream was consumed successfully,
 */

const consumeStream = async (readStream, handleDataChunk) => {
    return new Promise((resolve, reject) => {
        let carry = '';

        readStream.on('data', (chunk) => {
            const stringChunk = '' + chunk; // convert to string

            const {text, lastWord} = _separateLastWordFromText(stringChunk);

            // concatenate the carry (last word) from the previous chunk to the beginning of the current one.
            const textToHandle = carry + text;

            console.log(textToHandle);

            try {
                handleDataChunk(textToHandle);
            }
            catch (err) {
                console.error(err);

                readStream.destroy();
                reject(err);
            }

            // save the current carry for the next incoming chunk of data
            carry = lastWord;
        });

        readStream.on('end', () => {
            // handle the last carry
            handleDataChunk(carry);

            console.log('Stream fully consumed!');
            resolve();
        });

        readStream.on('error', (err) => {
            console.error(err);

            readStream.destroy();
            reject(err)
        });
    });
};

module.exports = { consumeStream };