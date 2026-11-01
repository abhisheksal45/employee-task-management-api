package com.example.employeetaskmanager.service;



import com.example.employeetaskmanager.DTO.LoginRequest;
import com.example.employeetaskmanager.DTO.LoginResponse;
import com.example.employeetaskmanager.DTO.RegisterRequest;
import com.example.employeetaskmanager.DTO.UserResponse;
import com.example.employeetaskmanager.Exception.DuplicateResourceException;
import com.example.employeetaskmanager.Service.AuthService;
import com.example.employeetaskmanager.model.AppUser;
import com.example.employeetaskmanager.model.Role;
import com.example.employeetaskmanager.Repository.UserRepository;
import com.example.employeetaskmanager.security.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    // ---------- register ----------

    @Test
    @DisplayName("register: hashes password, lowercases username, always USER role")
    void register_valid_savesHashedPasswordWithUserRole() {
        when(userRepository.existsByUsername("rahul")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("HASHED");
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> {
            AppUser saved = invocation.getArgument(0);
            saved.setId(5L);
            return saved;
        });

        UserResponse response = authService.register(new RegisterRequest("Rahul", "secret123"));

        assertEquals("rahul", response.username());
        assertEquals(Role.USER, response.role());

        ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository).save(captor.capture());
        assertEquals("HASHED", captor.getValue().getPassword());
    }

    @Test
    @DisplayName("register: taken username -> exception, nothing saved")
    void register_duplicate_throws() {
        when(userRepository.existsByUsername("rahul")).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> authService.register(new RegisterRequest("rahul", "secret123")));

        verify(userRepository, never()).save(any(AppUser.class));
    }

    // ---------- login ----------

    @Test
    @DisplayName("login: valid credentials -> token, username is lowercased")
    void login_valid_returnsToken() {
        Authentication authenticated = UsernamePasswordAuthenticationToken.authenticated(
                "rahul", null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        LoginResponse expected = new LoginResponse("token-value", "Bearer", 3600);

        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenReturn(authenticated);
        when(jwtService.generateToken(authenticated)).thenReturn(expected);

        LoginResponse response = authService.login(new LoginRequest("Rahul", "secret123"));

        assertEquals("token-value", response.accessToken());

        ArgumentCaptor<Authentication> captor = ArgumentCaptor.forClass(Authentication.class);
        verify(authenticationManager).authenticate(captor.capture());
        assertEquals("rahul", captor.getValue().getName());
    }

    @Test
    @DisplayName("login: wrong password -> exception and no token is created")
    void login_badCredentials_throws() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest("rahul", "wrong")));

        verifyNoInteractions(jwtService);
    }
}