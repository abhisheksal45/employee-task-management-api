package com.example.employeetaskmanager.controller;

import com.example.employeetaskmanager.DTO.EmployeeRequest;
import com.example.employeetaskmanager.DTO.EmployeeResponse;
import com.example.employeetaskmanager.DTO.PageResponse;
import com.example.employeetaskmanager.Exception.DuplicateResourceException;
import com.example.employeetaskmanager.Exception.ResourceNotFoundException;
import com.example.employeetaskmanager.Service.EmployeeService;
import com.example.employeetaskmanager.Service.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EmployeeController.class)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EmployeeService employeeService;

    @MockitoBean
    private TaskService taskService;      // Controller ko ye bhi chahiye, isliye ise bhi mock karo

    // ---------- GET ----------

    @Test
    @DisplayName("GET /api/employees/{id} -> 200 with JSON")
    void getById_found_returns200() throws Exception {
        when(employeeService.getEmployeeById(1L))
                .thenReturn(new EmployeeResponse(1L, "Rahul", 1L, "IT"));

        mockMvc.perform(get("/api/employees/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Rahul"))
                .andExpect(jsonPath("$.departmentName").value("IT"));
    }

    @Test
    @DisplayName("GET unknown id -> 404 in our standard error format")
    void getById_missing_returns404WithErrorBody() throws Exception {
        when(employeeService.getEmployeeById(99L))
                .thenThrow(new ResourceNotFoundException("Employee not found with id 99"));

        mockMvc.perform(get("/api/employees/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Employee not found with id 99"))
                .andExpect(jsonPath("$.path").value("/api/employees/99"));
    }

    @Test
    @DisplayName("GET list returns a page response")
    void list_returnsPage() throws Exception {
        PageResponse<EmployeeResponse> page = new PageResponse<>(
                List.of(new EmployeeResponse(1L, "Rahul", 1L, "IT")),
                0, 10, 1L, 1, true, true);
        when(employeeService.getAllEmployees(any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Rahul"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    @DisplayName("GET with unknown sort field -> 400, service never called")
    void list_badSortField_returns400() throws Exception {
        mockMvc.perform(get("/api/employees").param("sortBy", "salary"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Invalid sort field")));

        verifyNoInteractions(employeeService);
    }

    @Test
    @DisplayName("GET with invalid enum value -> 400")
    void list_badTaskStatus_returns400() throws Exception {
        mockMvc.perform(get("/api/employees").param("taskStatus", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("taskStatus")));
    }

    // ---------- POST ----------

    @Test
    @DisplayName("POST valid body -> 201")
    void create_valid_returns201() throws Exception {
        when(employeeService.createEmployee(any(EmployeeRequest.class)))
                .thenReturn(new EmployeeResponse(10L, "Rahul", 1L, "IT"));

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Rahul\",\"departmentId\":1}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10));
    }

    @Test
    @DisplayName("POST blank name -> 400 with field error, service never called")
    void create_blankName_returns400() throws Exception {
        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"departmentId\":1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.name").exists());

        verifyNoInteractions(employeeService);
    }

    @Test
    @DisplayName("POST without departmentId -> 400")
    void create_missingDepartmentId_returns400() throws Exception {
        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Rahul\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.departmentId").value("Department id is required"));
    }

    @Test
    @DisplayName("POST duplicate -> 409")
    void create_duplicate_returns409() throws Exception {
        when(employeeService.createEmployee(any(EmployeeRequest.class)))
                .thenThrow(new DuplicateResourceException("Employee 'Rahul' already exists"));

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Rahul\",\"departmentId\":1}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("POST broken JSON -> 400")
    void create_malformedJson_returns400() throws Exception {
        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed or missing JSON request body"));
    }

    // ---------- PUT / DELETE ----------

    @Test
    @DisplayName("PUT on the collection URL -> 405")
    void put_withoutId_returns405() throws Exception {
        mockMvc.perform(put("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Rahul\",\"departmentId\":1}"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    @DisplayName("DELETE -> 204 and service is called")
    void delete_returns204() throws Exception {
        mockMvc.perform(delete("/api/employees/1"))
                .andExpect(status().isNoContent());

        verify(employeeService).deleteEmployee(1L);
    }
}