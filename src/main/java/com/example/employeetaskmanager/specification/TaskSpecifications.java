package com.example.employeetaskmanager.specification;

import com.example.employeetaskmanager.model.Employee;
import com.example.employeetaskmanager.model.Task;
import com.example.employeetaskmanager.model.TaskStatus;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    public static Specification<Task> statusEquals(TaskStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Task> titleContains(String title) {
        return (root, query, cb) -> cb.like(
                cb.lower(root.<String>get("title")),
                SpecUtil.containsPattern(title),
                '\\');
    }

    // ye task is employee ko assign hai
    public static Specification<Task> assignedTo(Long employeeId) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Task, Employee> assignees = root.join("assignees");
            return cb.equal(assignees.get("id"), employeeId);
        };
    }
}