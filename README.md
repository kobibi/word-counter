# word-counter

## Assumptions:
* Encoding
    * The encoding of the data read either from the url or the file is UTF-8
* API
    * The word-count API entry point will receive two query parameters:
        * input - the string to process
        * inputType - the type of input
    * If inputType is not specified - the input value will be regarded as a regular string.
* URL
    * When processing a word-count request with a url, the content at the other end is textual.  
        * We an add validation for that, checking the response headers beforehand, with a HEAD request.
        * If we want to support other mime types, we can add some logic to convert
    * The given url accepts GET requests. It would be weird if it didn't.
    * The given url is accessible via http requests, and does not require https access
        * If needed, this can be specified in another query parameter indiciating which protocol to use

* File path
    * The file path given is an **absolute** path within the server.
    * In case of multiple deployed servers/containers - each server handles its own file processing.
* The space character (' ') is will be a very common text separator in the text.
    * This is important when processing chunks of text.
    * Since we do not know if a given
    chunk ends mid-word, we can carry the last piece of text after the last whitespace to the
    next iteration. 
    * For this to work we need the last whitespace to be close enough to the end of the string.
    * Another way is to first split the string into words, and then attach the last word to the 
    next iteration, but with my solution it will mean splitting the string twice.
    


## Nice-To-Have Capabilities
    
* **Request Auditing**
    * Each *word-count* request is audited and given a unique id.
    The id is returned in the response.
    * This id can be used for checking the status of the request by the user.
    * DB - request_audits table:
        * request_id
        * request_status
        * errors
        * input_type
        * input
        * created_at
        * updated_at
    * *Request Status*
        * Every request can have one the following statuses:
            * *pending* - The request was received by the server but not yet processed 
            * *in progress* - The request is currently being processed
            * *done* - The request processing was completed successfully
            * *failed* - The request processing has failed.
        * If a request has failed, the error which caused it to fail will be stored with it.
    * New API entry point: ```/request-status/<requestId>```
        * Will return the status of the given request, and if failed - which error it encountered.


* **Allow word statistics per request, as well as in total**  
    * Use case - If a user wants to investigate the results of a specific request.
    * How to implement
        * Db - word_count table columns:
            * request_id
            * word
            * count
        * Entry Point: `/word-statistics/word?requestId=abcd124`
            * If requestId is not supplied - give total statistics for the given word
            * If requestId is supplied - give statistics for the given word within the content of the given request
        * Querying:
            * Getting statistics for word for a specific request:
            
                ```
                SELECT count
                FROM word_count
                WHERE request_id = @requestId and word = @word`
                ```
            * Getting total statistics for a word
                ```
                SELECT SUM(count)
                FROM word_count
                WHERE word = @word`
                ```
* **Crash Recovery**
    * (Assuming we have request auditing)
    * If the server crashes while processing request - reprocess this task the next time it goes back up.
    * 'Incomplete' requests can be identified by:
        * status is 'in progress', and
        * Time difference between current time and the 'updated_at' value exceeds a certain threshold. 
    * Recovery
        * Option 1 (my preferred option) - recover when the service initializes
        * Option 2 - use a scheduled task.
    * Recovery logic     
        * Start an asynchronous task for reading and reprocessing incomplete tasks.
        * This task will run in a loop, picking up one task at a time until there are no incomplete tasks left.
        * for each task:
            * Immediately change updated_at field, in case there are multiple instances trying to locate incomplete tasks.
            * reprocess the query
            * update the status when done
    * Separating results while request is in progress
        * In order to support recovery, i.e. re-processing a request from the beginning, we must separate the results
        of each request from the total results until it is complete.
        * Option 1 - In case we store word count results per-request.
            * Add a 'pending' flag/column for each word record as long as the request is being processed.
            * reset when the processing is complete.
            * when querying - filter out records with the 'pending' flag set.
        * Option 2 - In case We store only the aggregated word count of all previous requests
            * In that case, we need a separate temporary storage for the results of requests in progress.
            * This temp storage can be a separate table, quite similar to the per-request solution suggested above
            * When a request's processing is complete:
                * Add the results of that request to the main table
                * Delete the request's record from the temp table.
    * Advanced - pick up from where we left off (overkill?)
        * After reading each batch of data - store how many bytes/chars we read
        * During recovery - pick up from that point instead of starting all over again 
        * Can be done for files. With data urls - I'm not sure, since the Server must support streaming from an offset  
