CREATE DATABASE IF NOT EXISTS vanish_chat
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vanish_chat;

CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_name VARCHAR(30) NOT NULL,
  created_at BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rooms_room_name (room_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_id BIGINT UNSIGNED NOT NULL,
  username VARCHAR(24) NOT NULL,
  content VARCHAR(1000) NOT NULL,
  created_at BIGINT UNSIGNED NOT NULL,
  expires_at BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_messages_room_expiry (room_id, expires_at),
  KEY idx_messages_expiry (expires_at),
  CONSTRAINT fk_messages_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
