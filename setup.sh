echo 'stopping old image...'

docker stop kobi-mysql



echo 'clearing old image...'

docker rm kobi-mysql



echo 'creating a new docker volume...'

docker volume create mysql-volume


echo 'setting up new docker image for mysql'

docker run --name=kobi-mysql -v mysql-volume -p 3306:3306 -e MYSQL_ROOT_PASSWORD=wordcounter -d mysql/mysql-server:latest

docker cp ./setup-docker.sh kobi-mysql:/



echo 'copying sql script into docker container...'
docker cp ./setup-db.sql kobi-mysql:/
docker cp ./after-restart.sql kobi-mysql:/

docker exec kobi-mysql chmod +x setup-docker.sh








