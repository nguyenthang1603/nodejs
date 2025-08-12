-- Schema for mom_baby_shop
CREATE DATABASE IF NOT EXISTS mom_baby_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mom_baby_shop;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  role ENUM('customer','admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  inventory INT DEFAULT 0,
  category_id INT,
  brand_id INT,
  age_min INT DEFAULT 0,
  age_max INT DEFAULT 120,
  images JSON,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSON,
  payment_method ENUM('cod','bank','momo','vnpay') DEFAULT 'cod',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- Seed data
INSERT INTO categories (name, slug) VALUES
('Đồ mặc', 'do-mac'),
('Đồ cho bé', 'do-cho-be')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO brands (name, slug) VALUES
('Pigeon', 'pigeon'),
('Huggies', 'huggies')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO products (name, slug, description, price, inventory, category_id, brand_id, age_min, age_max, images, is_featured)
VALUES
('Tã Huggies size M', 'ta-huggies-m', 'Tã siêu thấm cho bé 6-11kg', 250000, 100, 2, 2, 6, 24, JSON_ARRAY('https://via.placeholder.com/600x600?text=Ta+Huggies+M'), TRUE),
('Bình sữa Pigeon 240ml', 'binh-sua-pigeon-240', 'Bình sữa chống đầy hơi', 150000, 50, 2, 1, 0, 24, JSON_ARRAY('https://via.placeholder.com/600x600?text=Binh+sua+Pigeon'), TRUE)
ON DUPLICATE KEY UPDATE description=VALUES(description), price=VALUES(price), inventory=VALUES(inventory), is_featured=VALUES(is_featured);