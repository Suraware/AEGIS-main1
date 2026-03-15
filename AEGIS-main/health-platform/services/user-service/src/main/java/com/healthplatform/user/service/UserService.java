package com.healthplatform.user.service;

import com.healthplatform.user.model.UserPreferences;
import com.healthplatform.user.model.Watchlist;
import com.healthplatform.user.repository.UserPreferencesRepository;
import com.healthplatform.user.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final WatchlistRepository watchlistRepository;
    private final UserPreferencesRepository userPreferencesRepository;

    public List<Watchlist> getWatchlist(UUID userId) {
        return watchlistRepository.findByUserId(userId);
    }

    @Transactional
    public Watchlist addToWatchlist(UUID userId, String countryCode, String countryName) {
        if (watchlistRepository.existsByUserIdAndCountryCode(userId, countryCode)) {
            return null;
        }
        Watchlist watchlist = Watchlist.builder()
                .userId(userId)
                .countryCode(countryCode)
                .countryName(countryName)
                .build();
        return watchlistRepository.save(watchlist);
    }

    @Transactional
    public void removeFromWatchlist(UUID userId, String countryCode) {
        watchlistRepository.deleteByUserIdAndCountryCode(userId, countryCode);
    }

    public UserPreferences getPreferences(UUID userId) {
        return userPreferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
    }

    @Transactional
    public UserPreferences updatePreferences(UUID userId, List<String> layers, String theme) {
        UserPreferences prefs = getPreferences(userId);
        prefs.setDefaultLayers(layers);
        if (theme != null)
            prefs.setTheme(theme);
        return userPreferencesRepository.save(prefs);
    }

    private UserPreferences createDefaultPreferences(UUID userId) {
        UserPreferences prefs = UserPreferences.builder()
                .userId(userId)
                .defaultLayers(List.of("disease", "hospital"))
                .theme("DARK")
                .build();
        return userPreferencesRepository.save(prefs);
    }
}
