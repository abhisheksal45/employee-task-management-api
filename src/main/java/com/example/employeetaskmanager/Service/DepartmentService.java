package com.example.employeetaskmanager.Service;



import com.example.employeetaskmanager.DTO.DepartmentRequest;
import com.example.employeetaskmanager.DTO.DepartmentResponse;
import com.example.employeetaskmanager.Exception.ConflictException;
import com.example.employeetaskmanager.Exception.DuplicateResourceException;
import com.example.employeetaskmanager.Exception.ResourceNotFoundException;
import com.example.employeetaskmanager.model.Department;
import com.example.employeetaskmanager.Repository.DepartmentRepository;
import com.example.employeetaskmanager.Repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    public DepartmentResponse getDepartmentById(Long id) {
        return toResponse(findDepartmentOrThrow(id));
    }

    public DepartmentResponse createDepartment(DepartmentRequest request) {
        String name = request.getName().trim();
        if (departmentRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Department '" + name + "' already exists");
        }
        Department department = new Department();
        department.setName(name);
        return toResponse(departmentRepository.save(department));
    }

    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = findDepartmentOrThrow(id);
        String name = request.getName().trim();
        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateResourceException("Department '" + name + "' already exists");
        }
        department.setName(name);
        return toResponse(departmentRepository.save(department));
    }

    public void deleteDepartment(Long id) {
        Department department = findDepartmentOrThrow(id);
        long count = employeeRepository.countByDepartmentId(id);
        if (count > 0) {
            throw new ConflictException("Cannot delete department '" + department.getName()
                    + "' because it has " + count + " employee(s)");
        }
        departmentRepository.delete(department);
    }

    private Department findDepartmentOrThrow(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id " + id));
    }

    private DepartmentResponse toResponse(Department department) {
        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                employeeRepository.countByDepartmentId(department.getId()));
    }
}
