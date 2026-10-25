package com.example.employeetaskmanager.service;



import com.example.employeetaskmanager.DTO.StatusUpdateRequest;
import com.example.employeetaskmanager.DTO.TaskResponse;
import com.example.employeetaskmanager.Exception.ConflictException;
import com.example.employeetaskmanager.Exception.ResourceNotFoundException;
import com.example.employeetaskmanager.Service.TaskService;
import com.example.employeetaskmanager.model.Employee;
import com.example.employeetaskmanager.model.Task;
import com.example.employeetaskmanager.model.TaskStatus;
import com.example.employeetaskmanager.Repository.EmployeeRepository;
import com.example.employeetaskmanager.Repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private TaskService taskService;

    private Task task;
    private Employee rahul;

    @BeforeEach
    void setUp() {
        task = new Task();
        task.setId(1L);
        task.setTitle("Login page");

        rahul = new Employee();
        rahul.setId(1L);
        rahul.setName("Rahul");
    }

    @Test
    @DisplayName("assign: links both sides of the relationship")
    void assignTask_valid_linksTaskAndEmployee() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(rahul));

        TaskResponse response = taskService.assignTask(1L, 1L);

        assertEquals(1, response.getAssignees().size());
        assertEquals("Rahul", response.getAssignees().get(0).name());
        assertTrue(rahul.getTasks().contains(task));        // employee side
        assertTrue(task.getAssignees().contains(rahul));    // task side
    }

    @Test
    @DisplayName("assign: same task twice -> conflict")
    void assignTask_alreadyAssigned_throwsConflict() {
        rahul.addTask(task);   // pehle se assigned
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(rahul));

        assertThrows(ConflictException.class, () -> taskService.assignTask(1L, 1L));
    }

    @Test
    void assignTask_unknownTask_throwsNotFound() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.assignTask(99L, 1L));

        verifyNoInteractions(employeeRepository);
    }

    @Test
    void assignTask_unknownEmployee_throwsNotFound() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> taskService.assignTask(1L, 99L));

        assertEquals("Employee not found with id 99", ex.getMessage());
    }

    @Test
    @DisplayName("unassign: removes both sides of the relationship")
    void unassignTask_assigned_unlinksBothSides() {
        rahul.addTask(task);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(rahul));

        taskService.unassignTask(1L, 1L);

        assertFalse(rahul.getTasks().contains(task));
        assertTrue(task.getAssignees().isEmpty());
    }

    @Test
    void unassignTask_notAssigned_throwsNotFound() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(rahul));

        assertThrows(ResourceNotFoundException.class, () -> taskService.unassignTask(1L, 1L));
    }

    @Test
    @DisplayName("status update: changes the status without calling save()")
    void updateStatus_valid_changesStatus() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        TaskResponse response = taskService.updateStatus(1L,
                new StatusUpdateRequest(TaskStatus.DONE));

        assertEquals(TaskStatus.DONE, response.getStatus());
        verify(taskRepository, never()).save(any());   // dirty checking par bharosa (Day 8)
    }
}
