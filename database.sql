-- 1. Create a database
CREATE DATABASE survivorsync;

-- 2. Create a new user with a secure password
CREATE USER 'chathurya'@'localhost' IDENTIFIED BY 'password';

-- 3. Grant all privileges on the new database to the new user
GRANT ALL PRIVILEGES ON survivorsync.* TO 'chathurya'@'localhost';

-- 4. Apply the privilege changes
FLUSH PRIVILEGES;

USE survivorsync;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nic VARCHAR(20) NOT NULL UNIQUE,
  contact_number VARCHAR(20),
  address VARCHAR(255),
  role ENUM('admin', 'user', 'first_responder') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  refresh_token VARCHAR(500) NULL
);


SHOW TABLES;




