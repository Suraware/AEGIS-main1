CREATE TABLE health_alerts (
    id UUID PRIMARY KEY,
    country_code VARCHAR(10) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    risk_score INTEGER,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alert_country ON health_alerts(country_code);
CREATE INDEX idx_alert_timestamp ON health_alerts(timestamp);
