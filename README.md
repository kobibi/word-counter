# word-counter

A for counting words and keeping track.

## Setup and Run

To run the service, first setup the db container by running the following script from the root direcotry:
```
./setup.sh
```

Then, start the service with the following command:
```javascript
NODE_ENV=development node app.js
```


##API

The local service runs on port 3000

### Word Counter
Request for counting the number of times each word appears in the given input, and aggregate the results
along with past requests
#####URL
```http://localhost:3000/word-counter?input=[value]&inputType=[string/file/url]```

#####Parameters:
* **input** - a string. Can either be the string we want to process, a file path, or a url.
* **inputType** - indicates what the value of _input_ represents, and how it should be procssed.
    * If _inputType_ is left empty - the _input_ value is regarded as a simple string

#####Logic
Initiate a task for counting the words in the provided input, and return an acknowledgment of whether the request
was received and validated successfully.

Processing the input and counting its words is done asynchronously in the background.
#####Response
A JSON object.

In case of a successfully validated request:
```json
{
    success: true
}
``` 



### Word Statistics
Fetch, for a given word, the total number of times it has ever appeared in Word Conter inputs.
#####URL
```http://localhost:3000/word-statistics/[word]```

#####Parameters:
* **word** - Passed as a slug in the url's path. The word for which we want the information

#####Logic
This request is synchronous, and will return with the desired information.
#####Response
A JSON object.

In case of a successfully validated request:
```json
{
    success: true,
    data: {
        count: 239 // the total number of appearances
    }
}
```


###Health Check
An entry point for making sure that the service is up and running.

#####URL
```http://localhost:3000/healthcheck```

#####Logic
Check and make sure that the service itself all of the vital components it depends on are up and running.
In our case - the only other vital component is the db.

If the check fails - the service terminates itself, to allow (in production) replacing it with another instance. 




###Error Handling
In case there are either validation errors, or unexpected error while validating or processing a request, the response will be:
```json
{
    success: false,
    validationErrors: [
        "array of validation error messsages"
    ],
    error: "alternatively - a message about the error which caused the process to fail."
}
``` 


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
    * The data is retrieved from the given urls via GET requests. It would be weird if they didn't.
    * if no protocol is specified in the url - the default protocol is http. 

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
 
 
##End to End Tests
Due to low capaticy, hadn't managed to add e2e tests to the solution.

My plan for testing the service:
* User docker to mount a designated db for testing
* Bootstrap the service to listen for incoming requests
* Test the service using http requests to the api.
 
    



# Potential Advanced Capabilities - Suggestions
 
    
###Request Auditing

Allow tracking the asynchronous tasks counting the words - did they complete successfully, or fail.

**Suggestion**
 
* Each *word-count* request will be given a unique identifier.
* This identifier will be returned in the response, for future tracking.
* Audits Records 
    * A 'request audit' record will be saved in the db immediately with status 'in progress' for every incoming requst
    * If the task is completed successfully - its status will be changed to 'completed'. If it failed - then 'failed'.
    * The audit record willn include:
        * The requests's id
        * Input parameters
        * status
        * timestamps of creation and update
* Track request status
    * An entry point called 'request-status'
    * Requests will be sent with the desired request ID
    * The response will supply the current status of the task.
    * This can be useful for polling    

### Separate Results per Request
**Use Cases**
* Pending results from being claculated in the statistics until a request is processed successfully
* Allow word statistics per request, as well as in total  


**How to implement**
* Db - word_count table columns:
    * request_id
    * word
    * count
* Add optional 'requestId' query param to word-statistics: `/word-statistics/word?requestId=abcd124`
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
        
        
###Crash Recovery
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
