package com.healthplatform.user.repository;

import com.healthplatform.user.model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WatchlistRepository extends JpaRepository<Watchlist, UUID> {
    List<Watchlist> findByUserId(UUID userId);

    void deleteByUserIdAndCountryCode(UUID userId, String countryCode);

    boolean existsByUserIdAndCountryCode(UUID userId, String countryCode);
}
