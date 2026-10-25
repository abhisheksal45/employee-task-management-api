package com.example.employeetaskmanager.controller;


import com.example.employeetaskmanager.DTO.StatusUpdateRequest;
import com.example.employeetaskmanager.DTO.TaskRequest;
import com.example.employeetaskmanager.DTO.TaskResponse;
import com.example.employeetaskmanager.model.TaskStatus;
import com.example.employeetaskmanager.Service.TaskService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.example.employeetaskmanager.DTO.PageResponse;
import com.example.employeetaskmanager.util.PageUtil;
import java.util.Set;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Manage tasks and assign them to employees")
public class TaskController {
    private static final Set<String> SORT_FIELDS = Set.of("id", "title", "status");
    private final TaskService taskService;

    // GET /api/tasks  ya  GET /api/tasks?status=TODO
    // GET /api/tasks?page=0&size=5&sortBy=title&direction=desc&status=TODO
    // GET /api/tasks?status=TODO&title=login&assigneeId=1&page=0&size=5
    @GetMapping
    public PageResponse<TaskResponse> getAllTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        return taskService.getAllTasks(
                status, title, assigneeId,
                PageUtil.of(page, size, sortBy, direction, SORT_FIELDS));
    }

    @GetMapping("/{id}")
    public TaskResponse getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(@Valid @RequestBody TaskRequest request) {
        return taskService.createTask(request);
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(@PathVariable Long id,
                                   @Valid @RequestBody TaskRequest request) {
        return taskService.updateTask(id, request);
    }

    // PATCH: sirf ek hissa badalna (status)
    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(@PathVariable Long id,
                                     @Valid @RequestBody StatusUpdateRequest request) {
        return taskService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    // POST /api/tasks/1/assignees/2  (task 1 ko employee 2 ko do)
    @PostMapping("/{taskId}/assignees/{employeeId}")
    public TaskResponse assignTask(@PathVariable Long taskId, @PathVariable Long employeeId) {
        return taskService.assignTask(taskId, employeeId);
    }

    // DELETE /api/tasks/1/assignees/2
    @DeleteMapping("/{taskId}/assignees/{employeeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unassignTask(@PathVariable Long taskId, @PathVariable Long employeeId) {
        taskService.unassignTask(taskId, employeeId);
    }
}
