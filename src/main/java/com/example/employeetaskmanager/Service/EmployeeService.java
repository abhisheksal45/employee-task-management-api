package com.example.employeetaskmanager.Service;



import com.example.employeetaskmanager.DTO.EmployeeRequest;
import com.example.employeetaskmanager.DTO.EmployeeResponse;
import com.example.employeetaskmanager.DTO.PageResponse;
import com.example.employeetaskmanager.Exception.DuplicateResourceException;
import com.example.employeetaskmanager.Exception.ResourceNotFoundException;
import com.example.employeetaskmanager.model.Department;
import com.example.employeetaskmanager.model.Employee;
import com.example.employeetaskmanager.Repository.DepartmentRepository;
import com.example.employeetaskmanager.Repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.example.employeetaskmanager.model.TaskStatus;
import com.example.employeetaskmanager.specification.EmployeeSpecifications;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    // ---- Paged list (naya) ----
    public PageResponse<EmployeeResponse> getAllEmployees(
            String department, String name, TaskStatus taskStatus, Pageable pageable) {

        // shuruaat: koi condition nahi (sab employees)
        Specification<Employee> spec = (root, query, cb) -> cb.conjunction();

        if (StringUtils.hasText(department)) {
            spec = spec.and(EmployeeSpecifications.departmentNameEquals(department));
        }
        if (StringUtils.hasText(name)) {
            spec = spec.and(EmployeeSpecifications.nameContains(name));
        }
        if (taskStatus != null) {
            spec = spec.and(EmployeeSpecifications.hasTaskWithStatus(taskStatus));
        }

        Page<Employee> page = employeeRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(this::toResponse));
    }
    public List<EmployeeResponse> getEmployeesByDepartmentId(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found with id " + departmentId);
        }
        return employeeRepository.findByDepartmentId(departmentId)
                .stream().map(this::toResponse).toList();
    }

    public List<EmployeeResponse> searchByName(String name) {
        return employeeRepository.findByNameContainingIgnoreCase(name)
                .stream().map(this::toResponse).toList();
    }

    public long countByDepartment(String departmentName) {
        return employeeRepository.countByDepartmentNameIgnoreCase(departmentName);
    }

    public EmployeeResponse getEmployeeById(Long id) {
        return toResponse(findEmployeeOrThrow(id));
    }

    public EmployeeResponse createEmployee(EmployeeRequest request) {
        String name = request.getName().trim();
        Department department = findDepartmentOrThrow(request.getDepartmentId());

        if (employeeRepository.existsByNameIgnoreCaseAndDepartmentId(name, department.getId())) {
            throw new DuplicateResourceException("Employee '" + name
                    + "' already exists in department '" + department.getName() + "'");
        }

        Employee employee = new Employee();
        employee.setName(name);
        employee.setDepartment(department);
        return toResponse(employeeRepository.save(employee));
    }

    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee existing = findEmployeeOrThrow(id);
        String name = request.getName().trim();
        Department department = findDepartmentOrThrow(request.getDepartmentId());

        if (employeeRepository.existsByNameIgnoreCaseAndDepartmentIdAndIdNot(
                name, department.getId(), id)) {
            throw new DuplicateResourceException("Employee '" + name
                    + "' already exists in department '" + department.getName() + "'");
        }

        existing.setName(name);
        existing.setDepartment(department);
        return toResponse(employeeRepository.save(existing));
    }

    public void deleteEmployee(Long id) {
        employeeRepository.delete(findEmployeeOrThrow(id));
    }

    private Employee findEmployeeOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with id " + id));
    }

    private Department findDepartmentOrThrow(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id " + id));
    }

    private EmployeeResponse toResponse(Employee employee) {
        Department department = employee.getDepartment();
        return new EmployeeResponse(
                employee.getId(),
                employee.getName(),
                department.getId(),
                department.getName());
    }
}