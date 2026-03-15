package com.healthplatform.health.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String ALERTS_TOPIC = "health-alerts";
    private static final String SNAPSHOTS_TOPIC = "health-snapshots";

    public void publishAlert(Object alertData) {
        try {
            String payload = objectMapper.writeValueAsString(alertData);
            kafkaTemplate.send(ALERTS_TOPIC, payload);
            log.info("Published health alert: {}", payload);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize alert data", e);
        }
    }

    public void publishSnapshot(Object snapshotData) {
        try {
            String payload = objectMapper.writeValueAsString(snapshotData);
            kafkaTemplate.send(SNAPSHOTS_TOPIC, payload);
            log.info("Published health snapshot to Kafka");
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize snapshot data", e);
        }
    }
}
