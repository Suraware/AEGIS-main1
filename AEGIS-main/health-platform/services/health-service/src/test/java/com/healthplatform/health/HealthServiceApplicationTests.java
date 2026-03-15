package com.healthplatform.health;

import com.healthplatform.health.service.HealthDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.data.redis.core.RedisTemplate;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class HealthServiceApplicationTests {

    @Autowired
    private HealthDataService healthDataService;

    @MockBean
    private RedisTemplate<String, Object> redisTemplate;

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Test
    void contextLoads() {
        assertNotNull(healthDataService);
    }
}
