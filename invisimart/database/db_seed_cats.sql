-- Database seed script for "cats" set of product images

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

-- Insert example products
INSERT INTO products (product_id, name, image, price) VALUES
    ('1', 'Invisible Bow and Arrow', '/product_images/bow_and_arrow.png', 24.99),
    ('2', 'Invisible Bike', '/product_images/bike.png', 29.99),
    ('3', 'Invisible Corncob', '/product_images/corncob.png', 29.99),
    ('4', 'Invisible Lawnmower', '/product_images/lawnmower.png', 49.99),
    ('5', 'Invisible Pommel Horse', '/product_images/pommel_horse.png', 24.99),
    ('6', 'Invisible Sandwich', '/product_images/sandwich.png', 39.99),
    ('7', 'Invisible Shopping Cart', '/product_images/shopping_cart.png', 24.99),
    ('8', 'Invisible Skateboard', '/product_images/skateboard.png', 24.99),
    ('9', 'Invisible Snow Shovel', '/product_images/snow_shovel.png', 24.99),
    ('10', 'Invisible Violin', '/product_images/violin.png', 19.99),
    ('11', 'Invisible Window Installation', '/product_images/window_installation.png', 24.99),
    ('12', 'Invisible Million Dollar Check', '/product_images/million_dollar_check.png', 999999.99)
    ON CONFLICT (product_id) DO NOTHING;

