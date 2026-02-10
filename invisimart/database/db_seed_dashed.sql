-- Database seed script for "dashed" set of product images

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

-- Insert products with dashed image paths
INSERT INTO products (product_id, name, image, price) VALUES
  (1, 'Bicycle', '/product_images/dashed/bicycle.png', 900),
  (2, 'Bow and Arrow', '/product_images/dashed/bow_and_arrow.png', 250),
  (3, 'Corn on the Cob', '/product_images/dashed/corncob.png', 4),
  (4, 'Lawn Mower', '/product_images/dashed/lawn_mower.png', 400),
  (5, 'Coffee Mug', '/product_images/dashed/mug.png', 20),
  (6, 'Sandwich', '/product_images/dashed/sandwich.png', 13),
  (7, 'Skateboard', '/product_images/dashed/skateboard.png', 130),
  (8, 'Snow Shovel', '/product_images/dashed/snow_shovel.png', 35),
  (9, 'Violin', '/product_images/dashed/violin.png', 1300)
  ON CONFLICT (product_id) DO NOTHING;

-- Purchases table for storing order information with encrypted sensitive data
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone_encrypted TEXT NOT NULL,
    credit_card_encrypted TEXT NOT NULL,
    billing_address TEXT,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase items table for storing individual items in each order
CREATE TABLE IF NOT EXISTS purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_order_id ON purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
