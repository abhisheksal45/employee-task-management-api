package com.example.employeetaskmanager.service;


import com.example.employeetaskmanager.DTO.EmployeeRequest;
import com.example.employeetaskmanager.DTO.EmployeeResponse;
import com.example.employeetaskmanager.Exception.DuplicateResourceException;
import com.example.employeetaskmanager.Exception.ResourceNotFoundException;
import com.example.employeetaskmanager.Service.EmployeeService;
import com.example.employeetaskmanager.model.Department;
import com.example.employeetaskmanager.model.Employee;
import com.example.employeetaskmanager.Repository.DepartmentRepository;
import com.example.employeetaskmanager.Repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private EmployeeService employeeService;

    private Department itDepartment;

    @BeforeEach
    void setUp() {
        itDepartment = new Department();
        itDepartment.setId(1L);
        itDepartment.setName("IT");
    }

    // ---------- create ----------

    @Test
    @DisplayName("create: trims the name, saves, and returns a response")
    void createEmployee_validRequest_savesAndReturnsResponse() {
        // Arrange
        EmployeeRequest request = new EmployeeRequest("  Rahul  ", 1L);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(itDepartment));
        when(employeeRepository.existsByNameIgnoreCaseAndDepartmentId("Rahul", 1L))
                .thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee saved = invocation.getArgument(0);
            saved.setId(10L);              // database jaisa id de do
            return saved;
        });

        // Act
        EmployeeResponse response = employeeService.createEmployee(request);

        // Assert
        assertEquals(10L, response.getId());
        assertEquals("Rahul", response.getName());
        assertEquals("IT", response.getDepartmentName());

        ArgumentCaptor<Employee> captor = ArgumentCaptor.forClass(Employee.class);
        verify(employeeRepository).save(captor.capture());
        assertEquals("Rahul", captor.getValue().getName());   // trim hua tha
    }

    @Test
    @DisplayName("create: duplicate name in same department -> exception, nothing saved")
    void createEmployee_duplicate_throwsAndDoesNotSave() {
        EmployeeRequest request = new EmployeeRequest("Rahul", 1L);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(itDepartment));
        when(employeeRepository.existsByNameIgnoreCaseAndDepartmentId("Rahul", 1L))
                .thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> employeeService.createEmployee(request));

        verify(employeeRepository, never()).save(any());
    }

    @Test
    @DisplayName("create: unknown department -> not found, employee repo untouched")
    void createEmployee_unknownDepartment_throwsNotFound() {
        EmployeeRequest request = new EmployeeRequest("Rahul", 99L);
        when(departmentRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> employeeService.createEmployee(request));

        assertEquals("Department not found with id 99", ex.getMessage());
        verifyNoInteractions(employeeRepository);
    }

    // ---------- get ----------

    @Test
    void getEmployeeById_found_returnsResponse() {
        Employee employee = employee(1L, "Rahul");
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        EmployeeResponse response = employeeService.getEmployeeById(1L);

        assertEquals("Rahul", response.getName());
        assertEquals(1L, response.getDepartmentId());
    }

    @Test
    void getEmployeeById_missing_throwsNotFound() {
        when(employeeRepository.findById(5L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> employeeService.getEmployeeById(5L));

        assertEquals("Employee not found with id 5", ex.getMessage());
    }

    // ---------- update ----------

    @Test
    void updateEmployee_valid_changesFieldsAndSaves() {
        Employee existing = employee(1L, "Old Name");
        EmployeeRequest request = new EmployeeRequest("New Name", 1L);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(itDepartment));
        when(employeeRepository.save(existing)).thenReturn(existing);

        EmployeeResponse response = employeeService.updateEmployee(1L, request);

        assertEquals("New Name", response.getName());
        verify(employeeRepository).save(existing);
    }

    @Test
    void updateEmployee_nameTakenByAnotherEmployee_throwsDuplicate() {
        Employee existing = employee(1L, "Old Name");
        EmployeeRequest request = new EmployeeRequest("Taken", 1L);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(itDepartment));
        when(employeeRepository.existsByNameIgnoreCaseAndDepartmentIdAndIdNot("Taken", 1L, 1L))
                .thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> employeeService.updateEmployee(1L, request));

        verify(employeeRepository, never()).save(any());
    }

    // ---------- delete ----------

    @Test
    void deleteEmployee_found_deletes() {
        Employee existing = employee(1L, "Rahul");
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(existing));

        employeeService.deleteEmployee(1L);

        verify(employeeRepository).delete(existing);
    }

    @Test
    void deleteEmployee_missing_throwsAndDoesNotDelete() {
        when(employeeRepository.findById(7L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> employeeService.deleteEmployee(7L));

        verify(employeeRepository, never()).delete(any(Employee.class));
    }

    // ---------- helper ----------

    private Employee employee(Long id, String name) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setName(name);
        employee.setDepartment(itDepartment);
        return employee;
    }
}