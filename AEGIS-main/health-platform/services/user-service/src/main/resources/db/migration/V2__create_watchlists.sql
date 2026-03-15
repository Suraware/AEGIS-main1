CREATE TABLE watchlists (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    country_name VARCHAR(255) NOT NULL,
    added_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_watchlist_user ON watchlists(user_id);
