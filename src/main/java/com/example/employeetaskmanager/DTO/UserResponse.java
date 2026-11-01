package com.example.employeetaskmanager.DTO;

import com.example.employeetaskmanager.model.Role;

public record UserResponse(Long id, String username, Role role) {
}