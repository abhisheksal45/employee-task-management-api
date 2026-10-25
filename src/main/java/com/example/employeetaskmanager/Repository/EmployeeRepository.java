package com.example.employeetaskmanager.Repository;


import com.example.employeetaskmanager.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    // ---- Specification + Pageable (naya): department saath hi JOIN FETCH ----
    @Override
    @EntityGraph(attributePaths = "department")
    Page<Employee> findAll(Specification<Employee> spec, Pageable pageable);

    // ---- Purane ----
    @Override
    @EntityGraph(attributePaths = "department")
    Page<Employee> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "department")
    Page<Employee> findByDepartmentNameIgnoreCase(String departmentName, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "department")
    List<Employee> findAll();

    @EntityGraph(attributePaths = "department")
    List<Employee> findByDepartmentNameIgnoreCase(String departmentName);

    @EntityGraph(attributePaths = "department")
    List<Employee> findByDepartmentId(Long departmentId);

    @EntityGraph(attributePaths = "department")
    List<Employee> findByNameContainingIgnoreCase(String name);

    long countByDepartmentNameIgnoreCase(String departmentName);

    long countByDepartmentId(Long departmentId);

    boolean existsByNameIgnoreCaseAndDepartmentId(String name, Long departmentId);

    boolean existsByNameIgnoreCaseAndDepartmentIdAndIdNot(
            String name, Long departmentId, Long id);
}