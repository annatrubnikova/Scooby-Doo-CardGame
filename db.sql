CREATE DATABASE cardgame;
GRANT ALL PRIVILEGES ON cardgame.* TO 'atrubnikov'@'localhost';

USE cardgame;

CREATE TABLE IF NOT EXISTS users (
      id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      login varchar(30) UNIQUE NOT NULL,
      password varchar(255) NOT NULL,
      full_name varchar(255) NOT NULL,
      avatar varchar(255) NOT NULL DEFAULT 'shaggy_avatar.jpg',
      email varchar(255) NOT NULL,
      counter_wins int DEFAULT 0 NOT NULL,
      counter_losses int DEFAULT 0 NOT NULL
);
