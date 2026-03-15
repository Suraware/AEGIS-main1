CREATE TABLE health_snapshots (
    id UUID PRIMARY KEY,
    country_code VARCHAR(10) NOT NULL,
    risk_score INTEGER NOT NULL,
    covid_cases INTEGER,
    flu_level VARCHAR(20),
    hospital_capacity INTEGER,
    aqi INTEGER,
    active_trials INTEGER,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_snapshot_country_date ON health_snapshots(country_code, snapshot_date);
