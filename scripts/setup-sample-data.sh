#!/bin/bash

echo "Setting up sample data for testing..."

# Wait for database to be ready
until PGPASSWORD=demo123 psql -h localhost -p 5433 -U demo -d ecommerce -c '\q'; do
  >&2 echo "Sample database is unavailable - sleeping"
  sleep 1
done

>&2 echo "Sample database is up - executing commands"

# Create sample data
PGPASSWORD=demo123 psql -h localhost -p 5433 -U demo -d ecommerce <<-EOSQL
    -- Create schema if not exists
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

    -- Clear existing data
    TRUNCATE ecommerce.orders, ecommerce.products, ecommerce.customers RESTART IDENTITY CASCADE;

    -- Insert sample customers
    INSERT INTO ecommerce.customers (name, email, country, lifetime_value) VALUES
    ('John Doe', 'john@example.com', 'USA', 1250.00),
    ('Jane Smith', 'jane@example.com', 'UK', 2100.50),
    ('Bob Johnson', 'bob@example.com', 'Canada', 890.25),
    ('Alice Brown', 'alice@example.com', 'Australia', 3200.00),
    ('Charlie Wilson', 'charlie@example.com', 'Germany', 1500.75);

    -- Insert sample products
    INSERT INTO ecommerce.products (name, category, price) VALUES
    ('Laptop Pro', 'Electronics', 1299.99),
    ('Wireless Mouse', 'Electronics', 29.99),
    ('Office Chair', 'Furniture', 249.99),
    ('Standing Desk', 'Furniture', 599.99),
    ('Coffee Maker', 'Appliances', 89.99),
    ('Water Bottle', 'Accessories', 19.99),
    ('Notebook Set', 'Stationery', 14.99),
    ('Desk Lamp', 'Furniture', 39.99);

    -- Generate sample orders
    INSERT INTO ecommerce.orders (customer_id, order_date, total_amount, status)
    SELECT 
        (RANDOM() * 4 + 1)::INT,
        NOW() - (RANDOM() * INTERVAL '365 days'),
        (RANDOM() * 1000 + 10)::DECIMAL(10,2),
        CASE WHEN RANDOM() > 0.1 THEN 'completed' ELSE 'pending' END
    FROM generate_series(1, 100);

    -- Add some recent orders for testing
    INSERT INTO ecommerce.orders (customer_id, order_date, total_amount, status)
    SELECT 
        (RANDOM() * 4 + 1)::INT,
        NOW() - (RANDOM() * INTERVAL '30 days'),
        (RANDOM() * 500 + 50)::DECIMAL(10,2),
        'completed'
    FROM generate_series(1, 20);

    GRANT ALL PRIVILEGES ON SCHEMA ecommerce TO demo;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ecommerce TO demo;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ecommerce TO demo;
EOSQL

echo "Sample data setup complete!"