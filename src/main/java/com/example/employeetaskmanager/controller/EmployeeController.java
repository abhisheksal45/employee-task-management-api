package com.example.employeetaskmanager.controller;


import com.example.employeetaskmanager.DTO.EmployeeRequest;
import com.example.employeetaskmanager.DTO.EmployeeResponse;
import com.example.employeetaskmanager.DTO.PageResponse;
import com.example.employeetaskmanager.DTO.TaskResponse;
import com.example.employeetaskmanager.Exception.ErrorResponse;
import com.example.employeetaskmanager.model.TaskStatus;
import com.example.employeetaskmanager.Service.EmployeeService;
import com.example.employeetaskmanager.Service.TaskService;
import com.example.employeetaskmanager.util.PageUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Create, search, update and delete employees")
public class EmployeeController {

    private static final Set<String> SORT_FIELDS = Set.of("id", "name");

    private final EmployeeService employeeService;
    private final TaskService taskService;

    @Operation(summary = "List employees",
            description = "Paged list. All filters are optional and can be combined.")
    @GetMapping
    public PageResponse<EmployeeResponse> getAllEmployees(
            @Parameter(description = "Department name (case ignored)")
            @RequestParam(required = false) String department,
            @Parameter(description = "Employee name contains this text")
            @RequestParam(required = false) String name,
            @Parameter(description = "Has at least one task with this status")
            @RequestParam(required = false) TaskStatus taskStatus,
            @Parameter(description = "Page number, starts from 0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 50)")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field: id or name")
            @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction",
                    schema = @Schema(allowableValues = {"asc", "desc"}))
            @RequestParam(defaultValue = "asc") String direction) {

        return employeeService.getAllEmployees(
                department, name, taskStatus,
                PageUtil.of(page, size, sortBy, direction, SORT_FIELDS));
    }

    @Operation(summary = "Search employees by name (simple, not paged)")
    @GetMapping("/search")
    public List<EmployeeResponse> searchEmployees(
            @Parameter(description = "Text to search in name", example = "ra")
            @RequestParam String name) {
        return employeeService.searchByName(name);
    }

    @Operation(summary = "Count employees in a department")
    @GetMapping("/count")
    public long countByDepartment(
            @Parameter(description = "Department name", example = "IT")
            @RequestParam String department) {
        return employeeService.countByDepartment(department);
    }

    @Operation(summary = "Get one employee by id")
    @ApiResponse(responseCode = "200", description = "Employee found")
    @ApiResponse(responseCode = "404", description = "Employee not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @GetMapping("/{id}")
    public EmployeeResponse getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    @Operation(summary = "List tasks assigned to an employee")
    @ApiResponse(responseCode = "404", description = "Employee not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @GetMapping("/{id}/tasks")
    public List<TaskResponse> getTasksOfEmployee(@PathVariable Long id) {
        return taskService.getTasksOfEmployee(id);
    }

    @Operation(summary = "Create an employee",
            description = "Employee name must be unique within a department")
    @ApiResponse(responseCode = "201", description = "Employee created")
    @ApiResponse(responseCode = "400", description = "Validation failed",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "404", description = "Department not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "409", description = "Employee already exists in this department",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createEmployee(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.createEmployee(request);
    }

    @Operation(summary = "Update an employee")
    @ApiResponse(responseCode = "400", description = "Validation failed",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "404", description = "Employee or department not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "409", description = "Duplicate employee in department",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {
        return employeeService.updateEmployee(id, request);
    }

    @Operation(summary = "Delete an employee")
    @ApiResponse(responseCode = "204", description = "Employee deleted")
    @ApiResponse(responseCode = "404", description = "Employee not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
    }
}