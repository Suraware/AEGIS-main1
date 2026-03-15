package com.healthplatform.health.controller;

import com.healthplatform.health.service.HealthDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HealthController {

    private final HealthDataService healthDataService;

    @GetMapping("/{countryCode}/disease")
    public Object getDiseaseData(@PathVariable String countryCode) {
        return healthDataService.getDiseaseData(countryCode);
    }

    @GetMapping("/{countryCode}/hospitals")
    public Object getHospitalData(@PathVariable String countryCode) {
        return healthDataService.getHospitalData(countryCode);
    }

    @GetMapping("/{countryCode}/airquality")
    public Object getAirQualityData(@PathVariable String countryCode) {
        return healthDataService.getAirQualityData(countryCode);
    }

    @GetMapping("/{countryCode}/wastewater")
    public Object getWastewaterData(@PathVariable String countryCode) {
        return healthDataService.getWastewaterData(countryCode);
    }

    @GetMapping("/{countryCode}/trials")
    public Object getTrialsData(@PathVariable String countryCode) {
        return healthDataService.getTrialsData(countryCode);
    }

    @GetMapping("/{countryCode}/news")
    public Object getHealthNews(@PathVariable String countryCode, @RequestParam String countryName) {
        return healthDataService.getHealthNews(countryCode, countryName);
    }

    @GetMapping("/{countryCode}/all")
    public Object getAllHealthData(@PathVariable String countryCode) {
        return healthDataService.getAggregatedHealthData(countryCode);
    }
}
