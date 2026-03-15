package com.healthplatform.health.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthDataService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final RedisTemplate<String, Object> redisTemplate;
    private final HealthEventProducer healthEventProducer;

    private static final String CDC_COVID_URL = "https://data.cdc.gov/resource/9mfq-cb36.json";
    private static final String OPENAQ_URL = "https://api.openaq.org/v2/latest";

    @Scheduled(fixedRate = 3600000) 
    public void fetchCdcCovidData() {
        try {
            Object data = restTemplate.getForObject(CDC_COVID_URL, Object.class);
            redisTemplate.opsForValue().set("health:covid:latest", data, 70, TimeUnit.MINUTES);

            healthEventProducer.publishAlert(Map.of(
                    "type", "COVID_UPDATE",
                    "source", "CDC",
                    "timestamp", Instant.now().toString(),
                    "message", "New COVID-19 tracking data available from CDC",
                    "severity", "INFO"));

            healthEventProducer.publishSnapshot(Map.of(
                    "dataType", "COVID",
                    "timestamp", Instant.now().toString(),
                    "data", data));
        } catch (Exception e) {
            log.error("Failed to fetch CDC metadata", e);
        }
    }

    @Scheduled(fixedRate = 1800000) 
    public void fetchOpenAqData() {
        try {
            Object data = restTemplate.getForObject(OPENAQ_URL, Object.class);
            redisTemplate.opsForValue().set("health:aqi:latest", data, 40, TimeUnit.MINUTES);

            healthEventProducer.publishAlert(Map.of(
                    "type", "AQI_UPDATE",
                    "source", "OpenAQ",
                    "timestamp", Instant.now().toString(),
                    "message", "Global Air Quality indices updated",
                    "severity", "WARNING"));

            healthEventProducer.publishSnapshot(Map.of(
                    "dataType", "AQI",
                    "timestamp", Instant.now().toString(),
                    "data", data));
        } catch (Exception e) {
            log.error("Failed to fetch OpenAQ data", e);
        }
    }

    public Object getAggregatedHealthData(String countryCode) {
        
        return Map.of(
                "countryCode", countryCode,
                "disease", getDiseaseData(countryCode),
                "hospitals", getHospitalData(countryCode),
                "airquality", getAirQualityData(countryCode),
                "wastewater", getWastewaterData(countryCode),
                "trials", getTrialsData(countryCode),
                "news", getHealthNews(countryCode, "United States")); 
    }

    public Object getDiseaseData(String countryCode) {
        
        
        
        return Map.of(
                "covidLevel", "MODERATE",
                "fluLevel", "LOW",
                "weeklyTrend", generateSparklineData(),
                "alerts", java.util.List.of("WHO: Seasonal flu uptick in northern regions"));
    }

    public Object getHospitalData(String countryCode) {
        return Map.of(
                "overallCapacity", 72,
                "icuCapacity", 84,
                "status", "STRAINED");
    }

    public Object getAirQualityData(String countryCode) {
        return Map.of(
                "aqi", 42,
                "category", "Good",
                "dominantPollutant", "PM2.5",
                "cities", java.util.List.of(
                        Map.of("name", "Metropolis", "aqi", 45),
                        Map.of("name", "Suburbia", "aqi", 30),
                        Map.of("name", "Industrial Zone", "aqi", 65)));
    }

    public Object getWastewaterData(String countryCode) {
        return Map.of(
                "signalStrength", 65,
                "trend", "UP",
                "changePercentage", 12,
                "lastUpdated", Instant.now().toString());
    }

    public Object getTrialsData(String countryCode) {
        return Map.of(
                "totalActive", 124,
                "recentTrials", java.util.List.of(
                        Map.of("id", "NCT0123", "name", "Phase 3 mRNA Vaccine Study", "condition", "Influenza"),
                        Map.of("id", "NCT0456", "name", "Oncology Precision Med", "condition", "Lung Cancer"),
                        Map.of("id", "NCT0789", "name", "Diabetes Monitoring Tech", "condition", "Type 2 Diabetes")));
    }

    public Object getHealthNews(String countryCode, String countryName) {
        
        return java.util.List.of(
                Map.of(
                        "title", "New health protocols announced for " + countryName,
                        "source", "WHO News",
                        "timeAgo", "2 hours ago",
                        "summary",
                        "The World Health Organization has released updated guidelines for the upcoming season.",
                        "url", "https://www.who.int"),
                Map.of(
                        "title", "Hospital infrastructure improvements in " + countryCode,
                        "source", "Globe Health",
                        "timeAgo", "5 hours ago",
                        "summary",
                        "Recent investments in " + countryName + " have led to a 15% increase in ICU bed capacity.",
                        "url", "https://healthdata.gov"));
    }

    private java.util.List<Map<String, Integer>> generateSparklineData() {
        java.util.List<Map<String, Integer>> data = new java.util.ArrayList<>();
        for (int i = 1; i <= 30; i++) {
            data.add(Map.of("day", i, "cases", (int) (Math.random() * 1000) + 500));
        }
        return data;
    }
}
