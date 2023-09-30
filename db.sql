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

CREATE TABLE IF NOT EXISTS chat_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
