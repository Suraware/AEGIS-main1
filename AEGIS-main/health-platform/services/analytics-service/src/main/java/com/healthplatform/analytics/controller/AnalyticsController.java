package com.healthplatform.analytics.controller;

import com.healthplatform.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/trends/{countryCode}")
    public List<Map<String, Object>> getTrends(@PathVariable String countryCode) {
        return analyticsService.getTrends(countryCode);
    }
}
