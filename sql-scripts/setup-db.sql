CREATE DATABASE IF NOT EXISTS word_counter;

USE word_counter;

CREATE TABLE IF NOT EXISTS words (
    word varchar(255),
    count int(32),
    CONSTRAINT pk_words PRIMARY KEY (word)
);

ALTER USER "root"  IDENTIFIED WITH mysql_native_password BY "wordcounter";
flush privileges;

