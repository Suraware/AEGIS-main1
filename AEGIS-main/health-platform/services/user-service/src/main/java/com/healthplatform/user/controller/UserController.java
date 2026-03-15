package com.healthplatform.user.controller;

import com.healthplatform.user.model.UserPreferences;
import com.healthplatform.user.model.Watchlist;
import com.healthplatform.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}/watchlist")
    public List<Watchlist> getWatchlist(@PathVariable UUID userId) {
        return userService.getWatchlist(userId);
    }

    @PostMapping("/{userId}/watchlist")
    public Watchlist addToWatchlist(@PathVariable UUID userId, @RequestBody Watchlist request) {
        return userService.addToWatchlist(userId, request.getCountryCode(), request.getCountryName());
    }

    @DeleteMapping("/{userId}/watchlist/{countryCode}")
    public void removeFromWatchlist(@PathVariable UUID userId, @PathVariable String countryCode) {
        userService.removeFromWatchlist(userId, countryCode);
    }

    @GetMapping("/{userId}/preferences")
    public UserPreferences getPreferences(@PathVariable UUID userId) {
        return userService.getPreferences(userId);
    }

    @PutMapping("/{userId}/preferences")
    public UserPreferences updatePreferences(@PathVariable UUID userId, @RequestBody UserPreferences request) {
        return userService.updatePreferences(userId, request.getDefaultLayers(), request.getTheme());
    }
}
