-- Sample e-commerce data for testing
CREATE SCHEMA IF NOT EXISTS ecommerce;

-- Customers table
CREATE TABLE IF NOT EXISTS ecommerce.customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    country VARCHAR(50),
    lifetime_value DECIMAL(10,2)
);

-- Products table
CREATE TABLE IF NOT EXISTS ecommerce.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS ecommerce.orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES ecommerce.customers(id),
    order_date TIMESTAMP DEFAULT NOW(),
    total_amount DECIMAL(10,2),
    status VARCHAR(20)
);

-- Insert sample data
INSERT INTO ecommerce.customers (name, email, country, lifetime_value) VALUES
('John Doe', 'john@example.com', 'USA', 1250.00),
('Jane Smith', 'jane@example.com', 'UK', 2100.50),
('Bob Johnson', 'bob@example.com', 'Canada', 890.25);

-- Generate sample orders
INSERT INTO ecommerce.orders (customer_id, order_date, total_amount, status)
SELECT 
    (RANDOM() * 3 + 1)::INT,
    NOW() - (RANDOM() * INTERVAL '365 days'),
    (RANDOM() * 1000 + 10)::DECIMAL(10,2),
    CASE WHEN RANDOM() > 0.1 THEN 'completed' ELSE 'pending' END
FROM generate_series(1, 1000);