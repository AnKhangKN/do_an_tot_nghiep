-- SQL Database Initialization Script for do_an_tot_nghiep
-- Target DB: PostgreSQL (v13+)
-- NOTE: All UUID primary keys are generated at the Service layer in Node.js and passed to Repository.
-- No default database-level generators are used.

-- 1. Table: users
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'USER', -- 'USER', 'RESCUER', 'ADMIN'
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching and verifying users by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Table: user_auth
CREATE TABLE IF NOT EXISTS user_auth (
    user_auth_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'local', 'google'
    provider_id VARCHAR(255),
    password VARCHAR(255),
    UNIQUE (provider, provider_id)
);

-- Index for user auth lookup
CREATE INDEX IF NOT EXISTS idx_user_auth_user_id ON user_auth(user_id);

-- 3. Table: incident_types
CREATE TABLE IF NOT EXISTS incident_types (
    incident_type_id UUID PRIMARY KEY,
    incident_type VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: rescuer_profiles
CREATE TABLE IF NOT EXISTS rescuer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    gender VARCHAR(20),
    area VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'INACTIVE', -- 'ACTIVE', 'INACTIVE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP
);

-- 5. Table: rescue_incident_types (mapped from rescuer_incident_types.model.js)
CREATE TABLE IF NOT EXISTS rescue_incident_types (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    incident_type_id UUID REFERENCES incident_types(incident_type_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, incident_type_id)
);

-- 6. Table: sos_requests
CREATE TABLE IF NOT EXISTS sos_requests (
    sos_request_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    incident_type_id UUID NOT NULL REFERENCES incident_types(incident_type_id),
    description TEXT,
    victim_lat DOUBLE PRECISION NOT NULL,
    victim_lng DOUBLE PRECISION NOT NULL,
    geohash VARCHAR(20),
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'SEARCHING', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED'
    rescuer_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    assigned_at TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancel_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for rapid SOS requests querying & geohash proximity matching
CREATE INDEX IF NOT EXISTS idx_sos_requests_geohash ON sos_requests(geohash);
CREATE INDEX IF NOT EXISTS idx_sos_requests_user_id ON sos_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_requests_rescuer_id ON sos_requests(rescuer_id);
CREATE INDEX IF NOT EXISTS idx_sos_requests_status ON sos_requests(status);

-- 7. Table: images (formerly table 8)
CREATE TABLE IF NOT EXISTS images (
    image_id UUID PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'USER_AVATAR', 'SOS_REQUEST', etc.
    entity_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching images associated with entities (e.g. an SOS request or user profile)
CREATE INDEX IF NOT EXISTS idx_images_entity ON images(entity_type, entity_id);

-- 8. Table: vehicles (placeholder matching model)
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plate_number VARCHAR(50),
    vehicle_type VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for vehicles query
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);

-- 9. Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50), -- e.g. 'SOS_ALERT', 'SYSTEM'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for user notifications (very frequently accessed)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
