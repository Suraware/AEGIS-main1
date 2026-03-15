package com.healthplatform.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final String PREFIX = "refresh:";

    private final StringRedisTemplate redis;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationMs;

    
    public void store(String token, String email) {
        redis.opsForValue().set(PREFIX + token, email, refreshExpirationMs, TimeUnit.MILLISECONDS);
    }

    
    public Optional<String> getEmail(String token) {
        return Optional.ofNullable(redis.opsForValue().get(PREFIX + token));
    }

    
    public void delete(String token) {
        redis.delete(PREFIX + token);
    }

    public long getExpirationSeconds() {
        return refreshExpirationMs / 1000;
    }
}
