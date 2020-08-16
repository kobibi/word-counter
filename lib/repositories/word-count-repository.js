const mysql = require('mysql');

const pool  = mysql.createPool({
    connectionLimit : 100,
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'wordcounter',
    database: 'word_counter',
    protocol: 'tcp'
}, function(error) {
    console.error(error);
    throw error;
});

const _updateWordCount = async (word, count) => {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            port: 3306,
            password: 'wordcounter',
            database: 'word_counter',
            protocol: 'tcp'
        });


        const updateCountQuery = "INSERT INTO words (word, count) " +
            "VALUES (?, ?) " +
            "ON DUPLICATE KEY UPDATE " +
            "count = count + ?";

        const queryValues = [word, count, count];
        pool.query(updateCountQuery, queryValues, (error, results) => {
            if (error) {
                console.error(error);
                reject('Unable to save word count to database.');
            }

            if (results.affectedRows === 0) {
                reject('Word count not updated correctly.')
            }

            connection.end();
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
        const updateCountQuery = "SELECT count" +
            "FROM words" +
            "WHERE word = ?";

        const queryValues = [word];

        pool.query(updateCountQuery, queryValues, (error, results) => {
            if (error) {
                console.error(error);
                reject('Unable to retreive word count from db');
            }

            if (results.length === 0) {
                resolve(0);
            }

            resolve(results.length);
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
            _updateWordCount(word, wordCountMap[word]);
        });

    try {
        await Promise.all(wordUpdatePromises);
    }
    catch (err) {
        reject (err);
    }
};


/**
 * Retrieve the number stored for the given word, which represents the count of how many times it had appeard so far
 * in all word
 * @param word
 * @returns {Promise<void>}
 */
const getWordCount = async (word) => {
    console.log(JSON.stringify(wordCountMap));

    // Create an update Promise for every word in the map.
    const wordUpdatePromises = Object.keys(wordCountMap)
        .filter(wordCountMap.hasOwnProperty(key))
        .map((key) => {
            _updateWordCount(key, wordCountMap);
        });

    try {
        await Promise.all(wordUpdatePromises);
    } catch (err) {
        reject(err);
    }
};

module.exports = { saveWordCountMap, getWordCount };