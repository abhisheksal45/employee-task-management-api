import React, { useState, useEffect, useCallback } from 'react';
import {
  DepartmentAPI,
  EmployeeAPI,
  TaskAPI,
  AuthAPI,
  checkBackendConnection,
  ApiConfig,
  getStoredUser,
  isUserAdmin,
  subscribeAuth
} from './services/api';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import EmployeesView from './components/EmployeesView';
import DepartmentsView from './components/DepartmentsView';

import TaskModal from './components/TaskModal';
import EmployeeModal from './components/EmployeeModal';
import DepartmentModal from './components/DepartmentModal';
import AssigneeModal from './components/AssigneeModal';
import EmployeeDetailModal from './components/EmployeeDetailModal';
import DepartmentDetailModal from './components/DepartmentDetailModal';
import ConfirmModal from './components/ConfirmModal';
import AuthModal from './components/AuthModal';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('tasksphere_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tasksphere_theme', theme);
  }, [theme]);

  // Tab & UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Backend / Environment state
  const [isDemoMode, setIsDemoMode] = useState(ApiConfig.isDemoMode);
  const [isForceDemo, setIsForceDemo] = useState(ApiConfig.isForceDemo);
  const [backendChecking, setBackendChecking] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const isAdmin = isUserAdmin(currentUser);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Entities & Data
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allEmployeesForAssign, setAllEmployeesForAssign] = useState([]);

  // Pagination states
  const [taskPagination, setTaskPagination] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 1, first: true, last: true });
  const [employeePagination, setEmployeePagination] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 1, first: true, last: true });

  // Filters
  const [taskFilters, setTaskFilters] = useState({
    status: '',
    title: '',
    assigneeId: '',
    sortBy: 'id',
    direction: 'asc',
    page: 0,
    size: 10
  });

  const [employeeFilters, setEmployeeFilters] = useState({
    department: '',
    name: '',
    taskStatus: '',
    sortBy: 'id',
    direction: 'asc',
    page: 0,
    size: 10
  });

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskServerErrors, setTaskServerErrors] = useState(null);

  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeServerErrors, setEmployeeServerErrors] = useState(null);

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptServerErrors, setDeptServerErrors] = useState(null);

  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false);
  const [assigneeTask, setAssigneeTask] = useState(null);

  const [employeeDetailModalOpen, setEmployeeDetailModalOpen] = useState(false);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState(null);

  const [deptDetailModalOpen, setDeptDetailModalOpen] = useState(false);
  const [selectedDeptForDetail, setSelectedDeptForDetail] = useState(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

  // Toast Helper
  const showToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Listen to Auth State Changes (reactive token expiration / login / logout)
  useEffect(() => {
    const unsubscribe = subscribeAuth((user, event) => {
      setCurrentUser(user);
      if (event === 'expired') {
        showToast('Your session has expired. Please log in again.', 'error', 'Session Expired');
        setAuthModalMode('login');
        setAuthModalOpen(true);
      } else if (event === 'logout') {
        showToast('You have been signed out.', 'info');
      }
    });
    return () => unsubscribe();
  }, [showToast]);

  // Check Backend Connection
  const checkBackend = useCallback(async (notify = true) => {
    setBackendChecking(true);
    const reachable = await checkBackendConnection();
    setIsDemoMode(ApiConfig.isDemoMode);
    setIsForceDemo(ApiConfig.isForceDemo);
    setBackendChecking(false);

    if (reachable && !ApiConfig.isForceDemo) {
      // If reachable, verify current user via /api/auth/me
      const current = await AuthAPI.getCurrentUser();
      if (current) {
        setCurrentUser(current);
      }
    }

    if (notify) {
      if (reachable) {
        showToast('Successfully connected to Spring Boot backend on port 8080!', 'success', 'Backend Online');
      } else {
        showToast('Spring Boot server not detected. Operating in Demo/Mock Mode.', 'info', 'Demo Mode');
      }
    }
  }, [showToast]);

  // Load Departments
  const loadDepartments = useCallback(async () => {
    try {
      const data = await DepartmentAPI.getAll();
      setDepartments(data || []);
    } catch (err) {
      if (!err.isAuthError) {
        console.error('Error loading departments', err);
      }
    }
  }, []);

  // Load All Employees (for assignees dropdown)
  const loadAllEmployeesForAssign = useCallback(async () => {
    try {
      const res = await EmployeeAPI.getAll({ page: 0, size: 50 });
      setAllEmployeesForAssign(res.content || []);
    } catch (err) {
      if (!err.isAuthError) {
        console.error('Error loading all employees for assign', err);
      }
    }
  }, []);

  // Load Employees (Filtered & Paged)
  const loadEmployees = useCallback(async () => {
    try {
      const res = await EmployeeAPI.getAll(employeeFilters);
      setEmployees(res.content || []);
      setEmployeePagination({
        page: res.page,
        size: res.size,
        totalElements: res.totalElements,
        totalPages: res.totalPages,
        first: res.first,
        last: res.last
      });
    } catch (err) {
      if (!err.isAuthError) {
        console.error('Error loading employees', err);
        showToast(err.message, 'error', 'Failed to load employees');
      }
    }
  }, [employeeFilters, showToast]);

  // Load Tasks (Filtered & Paged)
  const loadTasks = useCallback(async () => {
    try {
      const res = await TaskAPI.getAll(taskFilters);
      setTasks(res.content || []);
      setTaskPagination({
        page: res.page,
        size: res.size,
        totalElements: res.totalElements,
        totalPages: res.totalPages,
        first: res.first,
        last: res.last
      });
    } catch (err) {
      if (!err.isAuthError) {
        console.error('Error loading tasks', err);
        showToast(err.message, 'error', 'Failed to load tasks');
      }
    }
  }, [taskFilters, showToast]);

  // Initial load
  useEffect(() => {
    checkBackend(false);
    loadDepartments();
    loadAllEmployeesForAssign();
  }, [checkBackend, loadDepartments, loadAllEmployeesForAssign]);

  // Load on filter changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Handle Demo Mode Toggle
  const handleToggleDemoMode = () => {
    const nextVal = !isForceDemo;
    ApiConfig.setForceDemo(nextVal);
    setIsForceDemo(nextVal);
    setIsDemoMode(ApiConfig.isDemoMode);
    checkBackend(true);
    setCurrentUser(getStoredUser());
    loadDepartments();
    loadTasks();
    loadEmployees();
    loadAllEmployeesForAssign();
  };

  const handleResetDemoData = () => {
    ApiConfig.resetDemoData();
    loadDepartments();
    loadTasks();
    loadEmployees();
    loadAllEmployeesForAssign();
    showToast('Demo dataset reset to initial state.', 'success', 'Reset Complete');
  };

  // Auth Handlers
  const handleAuthSuccess = (user, msg) => {
    setCurrentUser(user);
    showToast(msg || 'Signed in successfully!', 'success');
    loadDepartments();
    loadTasks();
    loadEmployees();
    loadAllEmployeesForAssign();
  };

  const handleLogout = () => {
    AuthAPI.logout();
    setCurrentUser(getStoredUser());
    if (!ApiConfig.isDemoMode) {
      setTasks([]);
      setEmployees([]);
      setDepartments([]);
    } else {
      loadDepartments();
      loadTasks();
      loadEmployees();
    }
  };

  const handleSwitchDemoRole = (newRole) => {
    const updated = AuthAPI.switchDemoRole(newRole);
    if (updated) {
      setCurrentUser(updated);
      showToast(`Demo role switched to ${newRole}`, 'info');
    }
  };

  const requireAdmin = (actionDescription) => {
    if (!isAdmin) {
      showToast(`Permission Denied: Administrator role (ROLE_ADMIN) required to ${actionDescription}.`, 'error');
      return false;
    }
    return true;
  };

  // ==========================================
  // TASK ACTIONS
  // ==========================================
  const handleCreateOrUpdateTask = async (data) => {
    if (!requireAdmin('create or update tasks')) return;
    setTaskServerErrors(null);
    try {
      if (editingTask) {
        await TaskAPI.update(editingTask.id, data);
        showToast(`Task #${editingTask.id} updated successfully!`, 'success');
      } else {
        const created = await TaskAPI.create(data);
        showToast(`Task #${created.id} created successfully!`, 'success');
      }
      loadTasks();
    } catch (err) {
      if (err.errors) {
        setTaskServerErrors(err.errors);
      }
      showToast(err.message || 'Operation failed', 'error', 'Error');
      throw err;
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    if (!requireAdmin('change task status')) return;
    try {
      await TaskAPI.updateStatus(taskId, newStatus);
      showToast(`Task status updated to ${newStatus.replace('_', ' ')}!`, 'success');
      loadTasks();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteTask = (task) => {
    if (!requireAdmin('delete tasks')) return;
    setConfirmConfig({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}" (ID #${task.id})?`,
      onConfirm: async () => {
        try {
          await TaskAPI.delete(task.id);
          showToast(`Task #${task.id} deleted successfully.`, 'info');
          setConfirmModalOpen(false);
          loadTasks();
        } catch (err) {
          showToast(err.message || 'Failed to delete task', 'error');
        }
      }
    });
    setConfirmModalOpen(true);
  };

  // Assign / Unassign
  const handleAssignEmployee = async (taskId, employeeId) => {
    if (!requireAdmin('assign employees')) return;
    try {
      const updated = await TaskAPI.assign(taskId, employeeId);
      showToast('Employee assigned to task!', 'success');
      setAssigneeTask(updated);
      loadTasks();
      loadEmployees();
    } catch (err) {
      showToast(err.message || 'Failed to assign employee', 'error');
    }
  };

  const handleUnassignEmployee = async (taskId, employeeId) => {
    if (!requireAdmin('unassign employees')) return;
    try {
      await TaskAPI.unassign(taskId, employeeId);
      showToast('Employee unassigned from task.', 'info');
      if (assigneeTask) {
        setAssigneeTask(prev => ({
          ...prev,
          assignees: prev.assignees.filter(a => a.id !== employeeId)
        }));
      }
      loadTasks();
      loadEmployees();
    } catch (err) {
      showToast(err.message || 'Failed to unassign employee', 'error');
    }
  };

  // ==========================================
  // EMPLOYEE ACTIONS
  // ==========================================
  const handleCreateOrUpdateEmployee = async (data) => {
    if (!requireAdmin('create or update employees')) return;
    setEmployeeServerErrors(null);
    try {
      if (editingEmployee) {
        await EmployeeAPI.update(editingEmployee.id, data);
        showToast(`Employee "${data.name}" updated successfully!`, 'success');
      } else {
        const created = await EmployeeAPI.create(data);
        showToast(`Employee "${created.name}" created!`, 'success');
      }
      loadEmployees();
      loadAllEmployeesForAssign();
      loadDepartments();
    } catch (err) {
      if (err.errors) {
        setEmployeeServerErrors(err.errors);
      }
      showToast(err.message || 'Operation failed', 'error', 'Error');
      throw err;
    }
  };

  const handleDeleteEmployee = (emp) => {
    if (!requireAdmin('delete employees')) return;
    setConfirmConfig({
      title: 'Delete Employee',
      message: `Are you sure you want to delete employee "${emp.name}" (ID #${emp.id})? Any task assignments will be unlinked.`,
      onConfirm: async () => {
        try {
          await EmployeeAPI.delete(emp.id);
          showToast(`Employee "${emp.name}" deleted.`, 'info');
          setConfirmModalOpen(false);
          loadEmployees();
          loadAllEmployeesForAssign();
          loadDepartments();
          loadTasks();
        } catch (err) {
          showToast(err.message || 'Failed to delete employee', 'error');
        }
      }
    });
    setConfirmModalOpen(true);
  };

  // ==========================================
  // DEPARTMENT ACTIONS
  // ==========================================
  const handleCreateOrUpdateDepartment = async (data) => {
    if (!requireAdmin('create or update departments')) return;
    setDeptServerErrors(null);
    try {
      if (editingDept) {
        await DepartmentAPI.update(editingDept.id, data);
        showToast(`Department "${data.name}" updated!`, 'success');
      } else {
        const created = await DepartmentAPI.create(data);
        showToast(`Department "${created.name}" created!`, 'success');
      }
      loadDepartments();
      loadEmployees();
    } catch (err) {
      if (err.errors) {
        setDeptServerErrors(err.errors);
      }
      showToast(err.message || 'Operation failed', 'error', 'Error');
      throw err;
    }
  };

  const handleDeleteDepartment = (dept) => {
    if (!requireAdmin('delete departments')) return;
    setConfirmConfig({
      title: 'Delete Department',
      message: `Are you sure you want to delete department "${dept.name}"? Note: Departments with active employees cannot be deleted.`,
      onConfirm: async () => {
        try {
          await DepartmentAPI.delete(dept.id);
          showToast(`Department "${dept.name}" deleted.`, 'info');
          setConfirmModalOpen(false);
          loadDepartments();
        } catch (err) {
          showToast(err.message || 'Failed to delete department', 'error');
        }
      }
    });
    setConfirmModalOpen(true);
  };

  return (
    <div className="app-container" id="task-sphere-app">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={{
          tasksCount: taskPagination.totalElements,
          employeesCount: employeePagination.totalElements,
          departmentsCount: departments.length
        }}
        isDemoMode={isDemoMode}
        isForceDemo={isForceDemo}
        onToggleDemoMode={handleToggleDemoMode}
        onResetDemoData={handleResetDemoData}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenLogin={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onSwitchDemoRole={handleSwitchDemoRole}
      />

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          theme={theme}
          setTheme={setTheme}
          isDemoMode={isDemoMode}
          backendChecking={backendChecking}
          onCheckBackend={() => checkBackend(true)}
          onOpenTaskModal={() => {
            setEditingTask(null);
            setTaskServerErrors(null);
            setTaskModalOpen(true);
          }}
          onOpenEmployeeModal={() => {
            setEditingEmployee(null);
            setEmployeeServerErrors(null);
            setEmployeeModalOpen(true);
          }}
          onOpenDepartmentModal={() => {
            setEditingDept(null);
            setDeptServerErrors(null);
            setDeptModalOpen(true);
          }}
          setMobileOpen={setMobileOpen}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onOpenLogin={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
          onOpenRegister={() => {
            setAuthModalMode('register');
            setAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onSwitchDemoRole={handleSwitchDemoRole}
        />

        {/* View Routing */}
        <main id="main-content-area">
          {activeTab === 'overview' && (
            <DashboardView
              departments={departments}
              employees={employees}
              tasks={tasks}
              isDemoMode={isDemoMode}
              setActiveTab={setActiveTab}
              onOpenTaskModal={() => {
                setEditingTask(null);
                setTaskServerErrors(null);
                setTaskModalOpen(true);
              }}
              onOpenEmployeeModal={() => {
                setEditingEmployee(null);
                setEmployeeServerErrors(null);
                setEmployeeModalOpen(true);
              }}
              onOpenDepartmentModal={() => {
                setEditingDept(null);
                setDeptServerErrors(null);
                setDeptModalOpen(true);
              }}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              currentUser={currentUser}
              isAdmin={isAdmin}
              isBackendReachable={ApiConfig.isBackendReachable}
              onOpenLogin={() => {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              }}
              onOpenRegister={() => {
                setAuthModalMode('register');
                setAuthModalOpen(true);
              }}
              onSwitchToDemo={handleToggleDemoMode}
              onSwitchDemoRole={handleSwitchDemoRole}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              employees={allEmployeesForAssign}
              filters={taskFilters}
              setFilters={setTaskFilters}
              pagination={taskPagination}
              onPageChange={(newPage) => setTaskFilters(prev => ({ ...prev, page: newPage }))}
              onPageSizeChange={(newSize) => setTaskFilters(prev => ({ ...prev, size: newSize, page: 0 }))}
              onOpenCreateTask={() => {
                setEditingTask(null);
                setTaskServerErrors(null);
                setTaskModalOpen(true);
              }}
              onOpenEditTask={(task) => {
                setEditingTask(task);
                setTaskServerErrors(null);
                setTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onUpdateStatus={handleUpdateTaskStatus}
              onOpenAssigneeModal={(task) => {
                setAssigneeTask(task);
                setAssigneeModalOpen(true);
              }}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView
              employees={employees}
              departments={departments}
              filters={employeeFilters}
              setFilters={setEmployeeFilters}
              pagination={employeePagination}
              onPageChange={(newPage) => setEmployeeFilters(prev => ({ ...prev, page: newPage }))}
              onOpenCreateEmployee={() => {
                setEditingEmployee(null);
                setEmployeeServerErrors(null);
                setEmployeeModalOpen(true);
              }}
              onOpenEditEmployee={(emp) => {
                setEditingEmployee(emp);
                setEmployeeServerErrors(null);
                setEmployeeModalOpen(true);
              }}
              onDeleteEmployee={handleDeleteEmployee}
              onViewEmployeeTasks={(emp) => {
                setSelectedEmployeeForDetail(emp);
                setEmployeeDetailModalOpen(true);
              }}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentsView
              departments={departments}
              employees={employees}
              onOpenCreateDepartment={() => {
                setEditingDept(null);
                setDeptServerErrors(null);
                setDeptModalOpen(true);
              }}
              onOpenEditDepartment={(dept) => {
                setEditingDept(dept);
                setDeptServerErrors(null);
                setDeptModalOpen(true);
              }}
              onDeleteDepartment={handleDeleteDepartment}
              onViewDepartmentEmployees={(dept) => {
                setSelectedDeptForDetail(dept);
                setDeptDetailModalOpen(true);
              }}
              isAdmin={isAdmin}
            />
          )}
        </main>
      </div>

      {/* Dialog Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleCreateOrUpdateTask}
        task={editingTask}
        serverErrors={taskServerErrors}
      />

      <EmployeeModal
        isOpen={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        onSubmit={handleCreateOrUpdateEmployee}
        employee={editingEmployee}
        departments={departments}
        serverErrors={employeeServerErrors}
      />

      <DepartmentModal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        onSubmit={handleCreateOrUpdateDepartment}
        department={editingDept}
        serverErrors={deptServerErrors}
      />

      <AssigneeModal
        isOpen={assigneeModalOpen}
        onClose={() => setAssigneeModalOpen(false)}
        task={assigneeTask}
        allEmployees={allEmployeesForAssign}
        onAssign={handleAssignEmployee}
        onUnassign={handleUnassignEmployee}
      />

      <EmployeeDetailModal
        isOpen={employeeDetailModalOpen}
        onClose={() => setEmployeeDetailModalOpen(false)}
        employee={selectedEmployeeForDetail}
        onUpdateTaskStatus={handleUpdateTaskStatus}
      />

      <DepartmentDetailModal
        isOpen={deptDetailModalOpen}
        onClose={() => setDeptDetailModalOpen(false)}
        department={selectedDeptForDetail}
        onViewEmployeeTasks={(emp) => {
          setSelectedEmployeeForDetail(emp);
          setEmployeeDetailModalOpen(true);
        }}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
      />

      {/* Authentication & Security Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        isDemoMode={isDemoMode}
        onSwitchToDemo={handleToggleDemoMode}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
