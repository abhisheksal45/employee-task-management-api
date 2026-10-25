package com.example.employeetaskmanager.DTO;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Data needed to create or update an employee")
public class EmployeeRequest {

    @Schema(description = "Full name of the employee", example = "Rahul Sharma")
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @Schema(description = "Id of an existing department", example = "1")
    @NotNull(message = "Department id is required")
    private Long departmentId;
}