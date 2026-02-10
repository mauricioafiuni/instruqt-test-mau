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
