package com.example.employeetaskmanager.Service;


import com.example.employeetaskmanager.DTO.LoginRequest;
import com.example.employeetaskmanager.DTO.LoginResponse;
import com.example.employeetaskmanager.DTO.RegisterRequest;
import com.example.employeetaskmanager.DTO.UserResponse;
import com.example.employeetaskmanager.Exception.DuplicateResourceException;
import com.example.employeetaskmanager.model.AppUser;
import com.example.employeetaskmanager.model.Role;
import com.example.employeetaskmanager.Repository.UserRepository;
import com.example.employeetaskmanager.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String username = request.getUsername().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username '" + username + "' is already taken");
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        AppUser saved = userRepository.save(user);
        return new UserResponse(saved.getId(), saved.getUsername(), saved.getRole());
    }

    public LoginResponse login(LoginRequest request) {
        // password galat ho to ye BadCredentialsException phenkta hai
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername().trim().toLowerCase(Locale.ROOT),
                        request.getPassword()));

        return jwtService.generateToken(authentication);
    }
}