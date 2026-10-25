package com.example.employeetaskmanager.Service;



import com.example.employeetaskmanager.DTO.AssigneeResponse;
import com.example.employeetaskmanager.DTO.StatusUpdateRequest;
import com.example.employeetaskmanager.DTO.TaskRequest;
import com.example.employeetaskmanager.DTO.TaskResponse;
import com.example.employeetaskmanager.Exception.ConflictException;
import com.example.employeetaskmanager.Exception.ResourceNotFoundException;
import com.example.employeetaskmanager.model.Employee;
import com.example.employeetaskmanager.model.Task;
import com.example.employeetaskmanager.model.TaskStatus;
import com.example.employeetaskmanager.Repository.EmployeeRepository;
import com.example.employeetaskmanager.Repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.employeetaskmanager.DTO.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import com.example.employeetaskmanager.specification.TaskSpecifications;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
@Service
@RequiredArgsConstructor
@Transactional   // is class ke saare methods transaction mein chalenge
public class TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> getAllTasks(
            TaskStatus status, String title, Long assigneeId, Pageable pageable) {

        Specification<Task> spec = (root, query, cb) -> cb.conjunction();

        if (status != null) {
            spec = spec.and(TaskSpecifications.statusEquals(status));
        }
        if (StringUtils.hasText(title)) {
            spec = spec.and(TaskSpecifications.titleContains(title));
        }
        if (assigneeId != null) {
            spec = spec.and(TaskSpecifications.assignedTo(assigneeId));
        }

        Page<Task> page = taskRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        return toResponse(findTaskOrThrow(id));
    }

    public TaskResponse createTask(TaskRequest request) {
        Task task = new Task();                       // status default TODO
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        return toResponse(taskRepository.save(task));
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findTaskOrThrow(id);
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        return toResponse(task);        // save() nahi: dirty checking karega (Day 8)
    }

    public TaskResponse updateStatus(Long id, StatusUpdateRequest request) {
        Task task = findTaskOrThrow(id);
        task.setStatus(request.getStatus());
        return toResponse(task);
    }

    public void deleteTask(Long id) {
        Task task = findTaskOrThrow(id);
        // Task inverse side hai, join table ki rows pehle khud hatani padengi.
        // Copy par loop: removeTask() original set badalta hai
        for (Employee employee : new ArrayList<>(task.getAssignees())) {
            employee.removeTask(task);
        }
        taskRepository.delete(task);
    }

    // ---- Assign / Unassign ----

    public TaskResponse assignTask(Long taskId, Long employeeId) {
        Task task = findTaskOrThrow(taskId);
        Employee employee = findEmployeeOrThrow(employeeId);

        if (task.getAssignees().contains(employee)) {
            throw new ConflictException("Task " + taskId
                    + " is already assigned to employee " + employeeId);
        }

        employee.addTask(task);          // dono side update
        return toResponse(task);         // commit par join table mein INSERT
    }

    public void unassignTask(Long taskId, Long employeeId) {
        Task task = findTaskOrThrow(taskId);
        Employee employee = findEmployeeOrThrow(employeeId);

        if (!task.getAssignees().contains(employee)) {
            throw new ResourceNotFoundException("Task " + taskId
                    + " is not assigned to employee " + employeeId);
        }

        employee.removeTask(task);       // commit par join table se DELETE
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksOfEmployee(Long employeeId) {
        Employee employee = findEmployeeOrThrow(employeeId);
        return employee.getTasks().stream()
                .sorted(Comparator.comparing(Task::getId))
                .map(this::toResponse)
                .toList();
    }

    // ---- helpers ----

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
    }

    private Employee findEmployeeOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id " + id));
    }

    private TaskResponse toResponse(Task task) {
        List<AssigneeResponse> assignees = task.getAssignees().stream()
                .sorted(Comparator.comparing(Employee::getId))
                .map(e -> new AssigneeResponse(e.getId(), e.getName()))
                .toList();
        return new TaskResponse(task.getId(), task.getTitle(), task.getDescription(),
                task.getStatus(), assignees);
    }
}
