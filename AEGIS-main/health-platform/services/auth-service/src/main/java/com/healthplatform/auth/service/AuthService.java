package com.healthplatform.auth.service;

import com.healthplatform.auth.dto.AuthResponse;
import com.healthplatform.auth.dto.LoginRequest;
import com.healthplatform.auth.dto.RegisterRequest;
import com.healthplatform.auth.entity.User;
import com.healthplatform.auth.repository.UserRepository;
import com.healthplatform.auth.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        var user = User.builder()
                .displayName(request.getDisplayName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .isVerified(false)
                .build();

        userRepository.save(user);

        var ud = buildUserDetails(user);
        var accessToken = jwtUtils.generateToken(ud);
        var refreshToken = jwtUtils.generateRefreshToken(ud);

        refreshTokenService.store(refreshToken, user.getEmail());

        return toResponse(user, accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        var ud = buildUserDetails(user);
        var accessToken = jwtUtils.generateToken(ud);
        var refreshToken = jwtUtils.generateRefreshToken(ud);

        refreshTokenService.store(refreshToken, user.getEmail());

        return toResponse(user, accessToken, refreshToken);
    }

    
    public AuthResponse refresh(String refreshToken) {
        
        String email;
        try {
            email = jwtUtils.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        
        String storedEmail = refreshTokenService.getEmail(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired or revoked"));

        if (!email.equals(storedEmail)) {
            
            refreshTokenService.delete(refreshToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token mismatch");
        }

        
        refreshTokenService.delete(refreshToken);

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        var ud = buildUserDetails(user);
        var newAccess = jwtUtils.generateToken(ud);
        var newRefresh = jwtUtils.generateRefreshToken(ud);

        refreshTokenService.store(newRefresh, email);

        return toResponse(user, newAccess, newRefresh);
    }

    
    public void logout(String refreshToken) {
        refreshTokenService.delete(refreshToken);
    }

    

    private UserDetails buildUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    private AuthResponse toResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .build();
    }
}


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        var user = User.builder()
                .displayName(request.getDisplayName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .isVerified(false)
                .build();

        userRepository.save(user);

        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();

        var jwtToken = jwtUtils.generateToken(userDetails);
        var refreshToken = jwtUtils.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();

        var jwtToken = jwtUtils.generateToken(userDetails);
        var refreshToken = jwtUtils.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .build();
    }
}
