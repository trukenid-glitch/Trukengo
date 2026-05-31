CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    no_wa VARCHAR(15) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer', -- Pakai varchar biasa biar fleksibel ndes
    nickname VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN base_address TEXT;



CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    operating_hours VARCHAR(150), -- Contoh: 'Senin - Jumat, 06:00 - 15:00'
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    price INT DEFAULT 0, 
    estimate VARCHAR(100), 
    is_open BOOLEAN DEFAULT true,
    product_photos TEXT[] DEFAULT '{}', 
    menu_photos TEXT[] DEFAULT '{}',    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE app_configs (
    id SERIAL PRIMARY KEY,
    pickup_fee_per_km INTEGER DEFAULT 1000,
    delivery_fee_per_km INTEGER DEFAULT 2000,
    fixed_jastip_fee INTEGER DEFAULT 2000,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Masukkan data awal (hanya satu kali)
INSERT INTO app_configs (pickup_fee_per_km, delivery_fee_per_km, fixed_jastip_fee) 
VALUES (1000, 2000, 2000);