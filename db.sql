CREATE DATABASE cardgame;
GRANT ALL PRIVILEGES ON cardgame.* TO 'atrubnikov'@'localhost';

USE cardgame;

CREATE TABLE IF NOT EXISTS users (
      id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      login varchar(30) UNIQUE NOT NULL,
      password varchar(255) NOT NULL,
      full_name varchar(255) NOT NULL,
      email varchar(255) NOT NULL
);
