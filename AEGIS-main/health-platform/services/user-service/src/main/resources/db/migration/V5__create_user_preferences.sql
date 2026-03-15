CREATE TABLE user_preferences (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    default_layers TEXT[],
    theme VARCHAR(50) DEFAULT 'DARK',
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
