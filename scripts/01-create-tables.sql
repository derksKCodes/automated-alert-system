-- Create database schema for Automated Data Collection System

-- Sources table to store data collection sources
CREATE TABLE IF NOT EXISTS sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'rss', 'api', 'web_scraping'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'error'
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories for organizing alerts
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- hex color for UI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keywords for filtering and matching
CREATE TABLE IF NOT EXISTS keywords (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    weight INTEGER DEFAULT 1, -- importance weight
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raw data collected from sources
CREATE TABLE IF NOT EXISTS raw_data (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES sources(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT,
    url TEXT,
    published_at TIMESTAMP,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE
);

-- Processed alerts after NLP and translation
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    raw_data_id INTEGER REFERENCES raw_data(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    translated_content TEXT,
    sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
    urgency_level INTEGER DEFAULT 1, -- 1-5 scale
    keywords_matched TEXT[], -- array of matched keywords
    url TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE
);

-- User settings and preferences
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    email_notifications BOOLEAN DEFAULT TRUE,
    notification_frequency VARCHAR(20) DEFAULT 'immediate', -- 'immediate', 'hourly', 'daily'
    min_urgency_level INTEGER DEFAULT 1,
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email notification log
CREATE TABLE IF NOT EXISTS notification_log (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
    email VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent' -- 'sent', 'failed', 'pending'
);

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
('Technology', 'Tech news and updates', '#3B82F6'),
('Security', 'Security alerts and vulnerabilities', '#EF4444'),
('Business', 'Business and market news', '#10B981'),
('Health', 'Health and medical updates', '#F59E0B'),
('Environment', 'Environmental news and alerts', '#22C55E')
ON CONFLICT (name) DO NOTHING;

-- Insert sample keywords
INSERT INTO keywords (category_id, keyword, weight) VALUES
(1, 'artificial intelligence', 3),
(1, 'machine learning', 3),
(1, 'blockchain', 2),
(1, 'cybersecurity', 2),
(2, 'vulnerability', 5),
(2, 'breach', 5),
(2, 'malware', 4),
(2, 'phishing', 3),
(3, 'market crash', 4),
(3, 'IPO', 2),
(3, 'merger', 2),
(4, 'pandemic', 5),
(4, 'vaccine', 3),
(4, 'outbreak', 4),
(5, 'climate change', 3),
(5, 'pollution', 2),
(5, 'renewable energy', 2)
ON CONFLICT DO NOTHING;

-- Insert sample sources
INSERT INTO sources (name, url, type) VALUES
('TechCrunch RSS', 'https://techcrunch.com/feed/', 'rss'),
('Security Week RSS', 'https://www.securityweek.com/feed/', 'rss'),
('Reuters Business', 'https://www.reuters.com/business/', 'web_scraping'),
('WHO Health Updates', 'https://www.who.int/feeds/entity/csr/don/en/rss.xml', 'rss')
ON CONFLICT DO NOTHING;
