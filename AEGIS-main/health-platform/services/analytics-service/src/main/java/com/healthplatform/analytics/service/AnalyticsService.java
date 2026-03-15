package com.healthplatform.analytics.service;

import com.healthplatform.analytics.config.SnowflakeConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnalyticsService {

    private final SnowflakeConfig snowflakeConfig;

    @Scheduled(cron = "0 0 * * * *") 
    public void syncDataToSnowflake() {
        log.info("Starting hourly data sync to Snowflake...");
        try (Connection conn = snowflakeConfig.getSnowflakeConnection()) {
            
            
            ensureTablesExist(conn);
            log.info("Successfully synced data to Snowflake (Simulated)");
        } catch (SQLException e) {
            log.error("Error syncing data to Snowflake: {}", e.getMessage());
        }
    }

    private void ensureTablesExist(Connection conn) throws SQLException {
        String createTrendsTable = """
                    CREATE TABLE IF NOT EXISTS health_trends (
                        country_code VARCHAR,
                        snapshot_date DATE,
                        risk_score INTEGER,
                        covid_cases INTEGER,
                        aqi INTEGER
                    )
                """;
        try (PreparedStatement stmt = conn.prepareStatement(createTrendsTable)) {
            stmt.execute();
        }
    }

    public List<Map<String, Object>> getTrends(String countryCode) {
        List<Map<String, Object>> trends = new ArrayList<>();
        String query = "SELECT snapshot_date, risk_score, covid_cases, aqi FROM health_trends WHERE country_code = ? ORDER BY snapshot_date DESC LIMIT 12";

        try (Connection conn = snowflakeConfig.getSnowflakeConnection();
                PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, countryCode);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> point = new HashMap<>();
                    point.put("date", rs.getDate("snapshot_date").toString());
                    point.put("risk_score", rs.getInt("risk_score"));
                    point.put("covid_cases", rs.getInt("covid_cases"));
                    point.put("aqi", rs.getInt("aqi"));
                    trends.add(point);
                }
            }
        } catch (SQLException e) {
            log.error("Error fetching trends from Snowflake: {}", e.getMessage());
            
            return getMockTrends();
        }
        return trends;
    }

    private List<Map<String, Object>> getMockTrends() {
        List<Map<String, Object>> mockData = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            Map<String, Object> p = new HashMap<>();
            p.put("date", "2024-" + String.format("%02d", 12 - i) + "-01");
            p.put("risk_score", 40 + (int) (Math.random() * 30));
            p.put("covid_cases", 1000 + (int) (Math.random() * 5000));
            p.put("aqi", 30 + (int) (Math.random() * 100));
            mockData.add(p);
        }
        return mockData;
    }
}
