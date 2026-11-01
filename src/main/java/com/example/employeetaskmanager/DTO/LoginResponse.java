package com.example.employeetaskmanager.DTO;

public record LoginResponse(String accessToken, String tokenType, long expiresInSeconds) {
}