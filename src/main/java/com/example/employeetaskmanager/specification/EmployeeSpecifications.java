package com.example.employeetaskmanager.specification;

import com.example.employeetaskmanager.model.Department;
import com.example.employeetaskmanager.model.Employee;
import com.example.employeetaskmanager.model.Task;
import com.example.employeetaskmanager.model.TaskStatus;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public final class EmployeeSpecifications {

    private EmployeeSpecifications() {
    }

    // department ka naam barabar (case ignore)
    public static Specification<Employee> departmentNameEquals(String departmentName) {
        return (root, query, cb) -> {
            Join<Employee, Department> department = root.join("department");
            return cb.equal(
                    cb.lower(department.<String>get("name")),
                    departmentName.trim().toLowerCase());
        };
    }

    // employee ke naam mein ye text ho
    public static Specification<Employee> nameContains(String name) {
        return (root, query, cb) -> cb.like(
                cb.lower(root.<String>get("name")),
                SpecUtil.containsPattern(name),
                '\\');
    }

    // kam se kam ek aisa task jiska ye status ho
    public static Specification<Employee> hasTaskWithStatus(TaskStatus status) {
        return (root, query, cb) -> {
            query.distinct(true);   // ek employee ke 2 matching tasks hon to bhi 1 hi baar aaye
            Join<Employee, Task> tasks = root.join("tasks");
            return cb.equal(tasks.get("status"), status);
        };
    }
}
