echo 'Setting up mysql container...'

docker run --name kobi-mysql \
-v $(pwd)/sql-scripts:/docker-entrypoint-initdb.d/ \
-e MYSQL_ROOT_PASSWORD=wordcounter \
-e MYSQL_DATABASE=word_counter \
-d -p 8806:3306 \
mysql

npm i




