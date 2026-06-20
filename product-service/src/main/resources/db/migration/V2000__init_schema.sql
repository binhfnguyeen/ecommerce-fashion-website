-- Khởi tạo bảng danh mục sản phẩm (categories)
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Khởi tạo bảng sản phẩm (products) liên kết với categories
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL, -- 'ACTIVE', 'INACTIVE'
    image_url VARCHAR(255),
    category_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tạo Index tối ưu hóa truy vấn
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Chèn dữ liệu mẫu cho danh mục (Categories)
INSERT INTO categories (name, description) VALUES 
('Áo Thun', 'Các sản phẩm áo thun thời trang nam nữ'),
('Quần Jean', 'Quần jean chất lượng cao, bền đẹp'),
('Áo Khoác', 'Áo khoác gió, áo khoác len giữ ấm'),
('Váy Đầm', 'Váy thời trang nữ dạo phố, dạ hội')
ON CONFLICT (name) DO NOTHING;

-- Chèn dữ liệu mẫu cho sản phẩm (Products)
-- Các ID 1, 2, 3, 4 tương ứng với các Categories trên theo thứ tự chèn
INSERT INTO products (name, description, price, stock, status, image_url, category_id) VALUES
('Áo Thun Unisex Basic', 'Áo thun cotton 100% thoáng mát, thấm hút mồ hôi tốt', 150000.00, 50, 'ACTIVE', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518', 1),
('Quần Jean Slimfit Nam', 'Quần jean co giãn dáng ôm trẻ trung năng động', 350000.00, 30, 'ACTIVE', 'https://images.unsplash.com/photo-1542272604-787c3835535d', 2),
('Áo Khoác Bomber Kaki', 'Áo khoác kaki dày dặn thời trang chống gió bụi', 450000.00, 20, 'ACTIVE', 'https://images.unsplash.com/photo-1551028719-00167b16eac5', 3),
('Đầm Lụa Dạo Phố', 'Váy đầm chất liệu lụa satin sang trọng quyến rũ', 600000.00, 15, 'ACTIVE', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8', 4),
('Áo Thun Polo Premium', 'Áo thun polo có cổ lịch sự, chất vải cá sấu cao cấp', 250000.00, 0, 'ACTIVE', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820', 1), -- Hết hàng để kiểm tra đặt hàng
('Váy Hoa Nhí Vintage', 'Váy hoa họa tiết vintage nhẹ nhàng thu hút mọi ánh nhìn', 320000.00, 10, 'INACTIVE', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1', 4) -- Không hoạt động để kiểm tra đặt hàng
ON CONFLICT DO NOTHING;
