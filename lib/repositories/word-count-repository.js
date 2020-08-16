const mysql = require('mysql');

const pool  = mysql.createPool({
    connectionLimit : 100,
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'wordcounter',
    database: 'word_counter',
    protocol: 'tcp'
}, (error) => {
    console.error(error);
    throw error;
});

/**
 * Healthy = we can connect to the db and run a query
 */
const healthCheck = async () => {
    return new Promise((resolve, reject) => {
        // no error handling. If this fails, all fails.
        pool.query('SHOW TABLES', (error) => {
           if(error) {
               reject(error);
           }
           resolve();
        });
    });
};

const _updateSingleWord = async (word, count) => {
    return new Promise((resolve, reject) => {
        const updateCountQuery = "INSERT INTO words (word, count) " +
            "VALUES (?, ?) " +
            "ON DUPLICATE KEY UPDATE " +
            "count = count + ?";

        const queryValues = [word, count, count];

        // Get a connection from the pool and
        pool.query(updateCountQuery, queryValues, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
            }

            if (results.affectedRows === 0) {
                reject(new Error('Word count not updated correctly.'));
            }
        });

        resolve();
    });
};

/**
 * Promisify the query sent to the db.
 * @param word
 * @returns {Promise<*>}
 * @private
 */
const _getWordCount = async (word) => {
    return new Promise((resolve, reject) => {
        const updateCountQuery = "SELECT count " +
            "FROM words " +
            "WHERE word = ?";

        const queryValues = [word];

        pool.query(updateCountQuery, queryValues, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
            }

            if (!results || results.length === 0 || !results[0]['count']) {
                resolve(0);
                return''
            }

            resolve(results[0]['count']);
        });
    });
};


/**
 * Saves a given word count map (<word: count> dictionary) to the database.
 * For each word: if it already exists, add the current count to the number in the db.
 *
 * This method will try to save all words in parallel, to the limit of the connection pool and db settings.
 *
 * @param wordCountMap
 * @returns {Promise<void>} Resolve if successful, reject with error message if not.
 */
const saveWordCountMap = async (wordCountMap) => {
    const wordUpdatePromises = Object.keys(wordCountMap)
        .filter((key) => wordCountMap.hasOwnProperty(key))
        .map ((word) => {
            _updateSingleWord(word, wordCountMap[word]);
        });

    try {
        await Promise.all(wordUpdatePromises);
    }
    catch (err) {
        console.error(err);
        throw new Error ("Could not complete saving all of the words to the database.")
    }
};


/**
 * Retrieve the number stored for the given word, which represents the count of how many times it had appeard so far
 * in all word
 * @param word - the word we're interested in
 * @returns {Promise<int>} The number of times the given word has appeared in strings up until now.
 */
const getWordCount = async (word) => {
    try {
        // Errors wil be caught by the BL
        const wordCount = await _getWordCount(word);
        return wordCount;
    }
    catch (err) {
        console.error(err);
        throw new Error ("Could not retrieve word count from the database.")
    }
};

module.exports = { saveWordCountMap, getWordCount, healthCheck };