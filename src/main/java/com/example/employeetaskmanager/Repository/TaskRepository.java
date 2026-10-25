package com.example.employeetaskmanager.Repository;



import com.example.employeetaskmanager.model.Task;
import com.example.employeetaskmanager.model.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TaskRepository
        extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    // paged + Specification: findAll(Specification, Pageable) pehle se mil jata hai.
    // Yahan @EntityGraph nahi (collection + paging = memory mein pagination, Day 11)

    Page<Task> findByStatus(TaskStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "assignees")
    List<Task> findAll();

    @Override
    @EntityGraph(attributePaths = "assignees")
    Optional<Task> findById(Long id);

    @EntityGraph(attributePaths = "assignees")
    List<Task> findByStatus(TaskStatus status);
}