package com.healthplatform.alert.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertBridgeService {
    private final SimpMessagingTemplate messagingTemplate;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String NOTIFICATIONS_TOPIC = "alert-notifications";

    @KafkaListener(topics = "health-alerts", groupId = "alert-processor-group")
    public void processHealthAlert(String alertPayload) {
        try {
            Map<String, Object> alert = objectMapper.readValue(alertPayload, new TypeReference<>() {
            });

            
            
            messagingTemplate.convertAndSend("/topic/health-alerts", alert);

            
            if (alert.containsKey("countryCode")) {
                String countryCode = String.valueOf(alert.get("countryCode")).toUpperCase();
                messagingTemplate.convertAndSend("/topic/country/" + countryCode, alert);
                log.info("Broadcasted alert to country channel: {}", countryCode);
            }

            
            kafkaTemplate.send(NOTIFICATIONS_TOPIC, alertPayload);
            log.info("Forwarded alert to {} topic via Kafka", NOTIFICATIONS_TOPIC);

        } catch (JsonProcessingException e) {
            log.error("Failed to parse incoming health alert from Kafka", e);
        }
    }
}
