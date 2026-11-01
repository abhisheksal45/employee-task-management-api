import { initialDepartments, initialEmployees, initialTasks } from './mockData';

// Storage keys
const STORAGE_KEYS = {
  DEPTS: 'tasksphere_mock_departments',
  EMPS: 'tasksphere_mock_employees',
  TASKS: 'tasksphere_mock_tasks',
  MODE: 'tasksphere_force_demo_mode',
  TOKEN: 'tasksphere_auth_token',
  USER: 'tasksphere_auth_user',
  EXPIRES_AT: 'tasksphere_auth_expires_at'
};

// Initialize Mock Local Storage if not present
function getStoredData(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStoredData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
}

// In-memory or persisted mock state
let mockDepartments = getStoredData(STORAGE_KEYS.DEPTS, initialDepartments);
let mockEmployees = getStoredData(STORAGE_KEYS.EMPS, initialEmployees);
let mockTasks = getStoredData(STORAGE_KEYS.TASKS, initialTasks);

function saveMockState() {
  setStoredData(STORAGE_KEYS.DEPTS, mockDepartments);
  setStoredData(STORAGE_KEYS.EMPS, mockEmployees);
  setStoredData(STORAGE_KEYS.TASKS, mockTasks);
}

// Mode state: live backend vs demo
let forceDemoMode = localStorage.getItem(STORAGE_KEYS.MODE) === 'true';
let backendReachable = false;

// Auth subscribers for reactive state changes (login, logout, session expiration)
const authListeners = new Set();
function notifyAuthChange(user, event = 'changed') {
  authListeners.forEach(cb => {
    try {
      cb(user, event);
    } catch (err) {
      console.error('Auth listener error', err);
    }
  });
}

// Default mock admin user for Demo Mode
const DEFAULT_DEMO_USER = {
  username: 'admin',
  roles: ['ROLE_ADMIN'],
  role: 'ADMIN'
};

// ==========================================
// TOKEN & AUTH STATE MANAGEMENT
// ==========================================
export function getAuthToken() {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    if (!token) return null;
    if (expiresAt && Date.now() > Number(expiresAt)) {
      clearAuthSession();
      return null;
    }
    return token;
  } catch (e) {
    return null;
  }
}

export function getStoredUser() {
  if (ApiConfig.isDemoMode) {
    const user = getStoredData(STORAGE_KEYS.USER, DEFAULT_DEMO_USER);
    return user;
  }
  return getStoredData(STORAGE_KEYS.USER, null);
}

export function setAuthSession(token, expiresInSeconds, user) {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      if (expiresInSeconds) {
        const expiresAt = Date.now() + expiresInSeconds * 1000;
        localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt));
      }
    }
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    notifyAuthChange(user, 'login');
  } catch (e) {
    console.error('Failed to set auth session', e);
  }
}

export function clearAuthSession(reason = 'logout') {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.USER);
    notifyAuthChange(null, reason);
  } catch (e) {
    console.error('Failed to clear auth session', e);
  }
}

export function isAuthenticated() {
  if (ApiConfig.isDemoMode) return true;
  return !!getAuthToken();
}

export function isUserAdmin(user) {
  const current = user || getStoredUser();
  if (!current) return false;
  if (Array.isArray(current.roles)) {
    return current.roles.includes('ROLE_ADMIN');
  }
  return current.role === 'ADMIN';
}

export function subscribeAuth(callback) {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
}

// ==========================================
// CONFIGURATION & CONNECTIVITY
// ==========================================
export const ApiConfig = {
  get isDemoMode() {
    return forceDemoMode || !backendReachable;
  },
  get isForceDemo() {
    return forceDemoMode;
  },
  setForceDemo(val) {
    forceDemoMode = val;
    localStorage.setItem(STORAGE_KEYS.MODE, val ? 'true' : 'false');
  },
  get isBackendReachable() {
    return backendReachable;
  },
  resetDemoData() {
    mockDepartments = [...initialDepartments];
    mockEmployees = [...initialEmployees];
    mockTasks = [...initialTasks];
    saveMockState();
  }
};

// Ping backend to determine connection status
// Note: When Spring Boot Security is active, unauthenticated requests return 401 Unauthorized,
// which proves that Spring Boot IS running and reachable (unlike Vite 502/504 Bad Gateway).
export async function checkBackendConnection() {
  if (forceDemoMode) {
    backendReachable = false;
    return false;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const token = getAuthToken();
    const headers = { 'Accept': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/departments', {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    // 502 / 503 / 504 is returned by Vite proxy when Spring Boot is NOT running
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      backendReachable = false;
      return false;
    }

    // Any response from Spring Boot (200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found)
    // proves the backend is live and answering requests!
    backendReachable = true;
    return true;
  } catch (err) {
    backendReachable = false;
    return false;
  }
}

// Authenticated fetch wrapper that attaches Bearer token header automatically
export async function authFetch(url, options = {}) {
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

// Helper to handle response and parse error response from backend
async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }

  // Detect 502/504 Bad Gateway from proxy (backend offline)
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    backendReachable = false;
    const error = new Error('Spring Boot backend is not running on port 8080 (502 Bad Gateway).');
    error.status = response.status;
    error.isProxyError = true;
    throw error;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  let data = null;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch (e) {
    data = null;
  }

  // 401 Unauthorized: token expired or missing
  if (response.status === 401) {
    const wasLoggedIn = !!getAuthToken();
    clearAuthSession('expired');
    const msg = data?.message || (wasLoggedIn ? 'Session expired. Please log in again.' : 'Authentication is required.');
    const error = new Error(msg);
    error.status = 401;
    error.isAuthError = true;
    error.details = data;
    throw error;
  }

  // 403 Forbidden: authenticated as USER but endpoint requires ADMIN
  if (response.status === 403) {
    const msg = data?.message || 'Access denied: Administrator privileges (ROLE_ADMIN) required for this action.';
    const error = new Error(msg);
    error.status = 403;
    error.isForbidden = true;
    error.details = data;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `HTTP error ${response.status}`);
    error.status = response.status;
    error.errors = data?.errors || null;
    error.details = data;
    throw error;
  }

  return data;
}

// Enforce role-check in Demo Mode so it behaves like Spring Boot security
function checkDemoAdminPermission(actionName = 'perform this action') {
  if (ApiConfig.isDemoMode) {
    const user = getStoredUser();
    if (!isUserAdmin(user)) {
      const error = new Error(`Permission Denied: Administrator role (ROLE_ADMIN) is required to ${actionName}. Current role: USER.`);
      error.status = 403;
      error.isForbidden = true;
      throw error;
    }
  }
}

// ==========================================
// AUTHENTICATION API
// ==========================================
export const AuthAPI = {
  async login({ username, password }) {
    const cleanUsername = (username || '').trim().toLowerCase();

    if (ApiConfig.isDemoMode) {
      if (!cleanUsername || !password) {
        throw new Error('Username and password are required');
      }
      // Demo logic: username 'admin' has ROLE_ADMIN, other users have ROLE_USER
      const isAdmin = cleanUsername === 'admin' || cleanUsername.includes('admin');
      const mockUser = {
        username: cleanUsername,
        roles: isAdmin ? ['ROLE_ADMIN'] : ['ROLE_USER'],
        role: isAdmin ? 'ADMIN' : 'USER'
      };
      const mockToken = `mock_jwt_token_${cleanUsername}_${Date.now()}`;
      setAuthSession(mockToken, 3600, mockUser);
      return {
        accessToken: mockToken,
        tokenType: 'Bearer',
        expiresInSeconds: 3600,
        user: mockUser
      };
    }

    // Live backend call: POST /api/auth/login
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ username: cleanUsername, password })
    });
    const loginData = await handleResponse(res); // returns { accessToken, tokenType, expiresInSeconds }

    // Fetch user details from GET /api/auth/me using the new token
    let currentUser = { username: cleanUsername, roles: ['ROLE_USER'] };
    try {
      const meRes = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${loginData.accessToken}`,
          'Accept': 'application/json'
        }
      });
      currentUser = await handleResponse(meRes); // returns { username, roles }
    } catch (err) {
      console.warn('Could not fetch user details from /api/auth/me', err);
    }

    // Save session
    setAuthSession(loginData.accessToken, loginData.expiresInSeconds, currentUser);

    return {
      ...loginData,
      user: currentUser
    };
  },

  async register({ username, password }) {
    const cleanUsername = (username || '').trim().toLowerCase();

    if (ApiConfig.isDemoMode) {
      if (!cleanUsername || cleanUsername.length < 3) {
        throw new Error('Username must be between 3 and 30 characters');
      }
      if (!password || password.length < 8) {
        throw new Error('Password must be between 8 and 64 characters');
      }
      return {
        id: Date.now(),
        username: cleanUsername,
        role: 'USER'
      };
    }

    // Live backend call: POST /api/auth/register
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ username: cleanUsername, password })
    });
    return handleResponse(res); // returns UserResponse { id, username, role }
  },

  async getCurrentUser() {
    if (ApiConfig.isDemoMode) {
      return getStoredUser();
    }
    const token = getAuthToken();
    if (!token) return null;

    try {
      const res = await authFetch('/api/auth/me');
      const user = await handleResponse(res);
      setStoredData(STORAGE_KEYS.USER, user);
      return user;
    } catch (err) {
      console.error('Failed to get current user', err);
      return null;
    }
  },

  logout() {
    clearAuthSession('logout');
  },

  // Toggle role in Demo Mode for easy client testing
  switchDemoRole(newRole) {
    if (!ApiConfig.isDemoMode) return;
    const current = getStoredUser() || DEFAULT_DEMO_USER;
    const isAdmin = newRole === 'ADMIN';
    const updatedUser = {
      ...current,
      role: isAdmin ? 'ADMIN' : 'USER',
      roles: isAdmin ? ['ROLE_ADMIN'] : ['ROLE_USER']
    };
    setStoredData(STORAGE_KEYS.USER, updatedUser);
    notifyAuthChange(updatedUser, 'role_switch');
    return updatedUser;
  }
};

// ==========================================
// DEPARTMENTS API
// ==========================================
export const DepartmentAPI = {
  async getAll() {
    if (ApiConfig.isDemoMode) {
      return mockDepartments.map(d => ({
        ...d,
        employeeCount: mockEmployees.filter(e => e.departmentId === d.id).length
      }));
    }
    const res = await authFetch('/api/departments');
    return handleResponse(res);
  },

  async getById(id) {
    if (ApiConfig.isDemoMode) {
      const dept = mockDepartments.find(d => d.id === Number(id));
      if (!dept) throw new Error(`Department with ID ${id} not found`);
      return {
        ...dept,
        employeeCount: mockEmployees.filter(e => e.departmentId === dept.id).length
      };
    }
    const res = await authFetch(`/api/departments/${id}`);
    return handleResponse(res);
  },

  async getEmployees(departmentId) {
    if (ApiConfig.isDemoMode) {
      return mockEmployees.filter(e => e.departmentId === Number(departmentId));
    }
    try {
      const res = await authFetch(`/api/departments/${departmentId}/employees`);
      return await handleResponse(res);
    } catch (err) {
      if (err.isProxyError || err.message?.includes('fetch') || err.message?.includes('502')) {
        backendReachable = false;
        return mockEmployees.filter(e => e.departmentId === Number(departmentId));
      }
      throw err;
    }
  },

  async create(payload) {
    checkDemoAdminPermission('create a department');

    if (ApiConfig.isDemoMode) {
      const newId = mockDepartments.length > 0 ? Math.max(...mockDepartments.map(d => d.id)) + 1 : 1;
      const newDept = { id: newId, name: payload.name.trim(), employeeCount: 0 };
      mockDepartments.push(newDept);
      saveMockState();
      return newDept;
    }
    const res = await authFetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async update(id, payload) {
    checkDemoAdminPermission('update a department');

    if (ApiConfig.isDemoMode) {
      const idx = mockDepartments.findIndex(d => d.id === Number(id));
      if (idx === -1) throw new Error(`Department with ID ${id} not found`);
      mockDepartments[idx].name = payload.name.trim();
      mockEmployees.forEach(e => {
        if (e.departmentId === Number(id)) {
          e.departmentName = payload.name.trim();
        }
      });
      saveMockState();
      return {
        ...mockDepartments[idx],
        employeeCount: mockEmployees.filter(e => e.departmentId === Number(id)).length
      };
    }
    const res = await authFetch(`/api/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async delete(id) {
    checkDemoAdminPermission('delete a department');

    if (ApiConfig.isDemoMode) {
      const hasEmployees = mockEmployees.some(e => e.departmentId === Number(id));
      if (hasEmployees) {
        const error = new Error('Cannot delete department with assigned employees.');
        error.status = 409;
        throw error;
      }
      mockDepartments = mockDepartments.filter(d => d.id !== Number(id));
      saveMockState();
      return true;
    }
    const res = await authFetch(`/api/departments/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  }
};

// ==========================================
// EMPLOYEES API
// ==========================================
export const EmployeeAPI = {
  async getAll({ department, name, taskStatus, page = 0, size = 10, sortBy = 'id', direction = 'asc' } = {}) {
    if (ApiConfig.isDemoMode) {
      let filtered = [...mockEmployees];

      if (department) {
        filtered = filtered.filter(e => e.departmentName.toLowerCase().includes(department.toLowerCase()));
      }
      if (name) {
        filtered = filtered.filter(e => e.name.toLowerCase().includes(name.toLowerCase()));
      }
      if (taskStatus) {
        const empIdsWithStatus = new Set();
        mockTasks.forEach(t => {
          if (t.status === taskStatus) {
            t.assignees.forEach(a => empIdsWithStatus.add(a.id));
          }
        });
        filtered = filtered.filter(e => empIdsWithStatus.has(e.id));
      }

      filtered.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        if (typeof valA === 'string') {
          return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return direction === 'asc' ? valA - valB : valB - valA;
      });

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const start = page * size;
      const content = filtered.slice(start, start + size);

      return {
        content,
        page,
        size,
        totalElements,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1
      };
    }

    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (name) params.append('name', name);
    if (taskStatus) params.append('taskStatus', taskStatus);
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('direction', direction);

    const res = await authFetch(`/api/employees?${params.toString()}`);
    return handleResponse(res);
  },

  async getById(id) {
    if (ApiConfig.isDemoMode) {
      const emp = mockEmployees.find(e => e.id === Number(id));
      if (!emp) throw new Error(`Employee with ID ${id} not found`);
      return emp;
    }
    const res = await authFetch(`/api/employees/${id}`);
    return handleResponse(res);
  },

  async getTasks(employeeId) {
    if (ApiConfig.isDemoMode) {
      return mockTasks.filter(t => t.assignees.some(a => a.id === Number(employeeId)));
    }
    try {
      const res = await authFetch(`/api/employees/${employeeId}/tasks`);
      return await handleResponse(res);
    } catch (err) {
      if (err.isProxyError || err.message?.includes('fetch') || err.message?.includes('502')) {
        backendReachable = false;
        return mockTasks.filter(t => t.assignees.some(a => a.id === Number(employeeId)));
      }
      throw err;
    }
  },

  async search(nameQuery) {
    if (ApiConfig.isDemoMode) {
      return mockEmployees.filter(e => e.name.toLowerCase().includes(nameQuery.toLowerCase()));
    }
    const res = await authFetch(`/api/employees/search?name=${encodeURIComponent(nameQuery)}`);
    return handleResponse(res);
  },

  async countByDepartment(deptName) {
    if (ApiConfig.isDemoMode) {
      return mockEmployees.filter(e => e.departmentName.toLowerCase() === deptName.toLowerCase()).length;
    }
    const res = await authFetch(`/api/employees/count?department=${encodeURIComponent(deptName)}`);
    return handleResponse(res);
  },

  async create(payload) {
    checkDemoAdminPermission('create an employee');

    if (ApiConfig.isDemoMode) {
      const dept = mockDepartments.find(d => d.id === Number(payload.departmentId));
      if (!dept) throw new Error('Department not found');

      const exists = mockEmployees.some(e => e.departmentId === dept.id && e.name.toLowerCase() === payload.name.trim().toLowerCase());
      if (exists) {
        const error = new Error(`Employee with name '${payload.name}' already exists in department '${dept.name}'`);
        error.status = 409;
        throw error;
      }

      const newId = mockEmployees.length > 0 ? Math.max(...mockEmployees.map(e => e.id)) + 1 : 1;
      const newEmp = {
        id: newId,
        name: payload.name.trim(),
        departmentId: dept.id,
        departmentName: dept.name
      };
      mockEmployees.push(newEmp);
      saveMockState();
      return newEmp;
    }

    const res = await authFetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async update(id, payload) {
    checkDemoAdminPermission('update an employee');

    if (ApiConfig.isDemoMode) {
      const idx = mockEmployees.findIndex(e => e.id === Number(id));
      if (idx === -1) throw new Error(`Employee with ID ${id} not found`);

      const dept = mockDepartments.find(d => d.id === Number(payload.departmentId));
      if (!dept) throw new Error('Department not found');

      mockEmployees[idx] = {
        id: Number(id),
        name: payload.name.trim(),
        departmentId: dept.id,
        departmentName: dept.name
      };
      mockTasks.forEach(t => {
        t.assignees.forEach(a => {
          if (a.id === Number(id)) {
            a.name = payload.name.trim();
          }
        });
      });
      saveMockState();
      return mockEmployees[idx];
    }

    const res = await authFetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async delete(id) {
    checkDemoAdminPermission('delete an employee');

    if (ApiConfig.isDemoMode) {
      mockEmployees = mockEmployees.filter(e => e.id !== Number(id));
      mockTasks.forEach(t => {
        t.assignees = t.assignees.filter(a => a.id !== Number(id));
      });
      saveMockState();
      return true;
    }
    const res = await authFetch(`/api/employees/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  }
};

// ==========================================
// TASKS API
// ==========================================
export const TaskAPI = {
  async getAll({ status, title, assigneeId, page = 0, size = 10, sortBy = 'id', direction = 'asc' } = {}) {
    if (ApiConfig.isDemoMode) {
      let filtered = [...mockTasks];

      if (status) {
        filtered = filtered.filter(t => t.status === status);
      }
      if (title) {
        filtered = filtered.filter(t => t.title.toLowerCase().includes(title.toLowerCase()));
      }
      if (assigneeId) {
        filtered = filtered.filter(t => t.assignees.some(a => a.id === Number(assigneeId)));
      }

      filtered.sort((a, b) => {
        const valA = a[sortBy] ?? '';
        const valB = b[sortBy] ?? '';
        if (typeof valA === 'string') {
          return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return direction === 'asc' ? valA - valB : valB - valA;
      });

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const start = page * size;
      const content = filtered.slice(start, start + size);

      return {
        content,
        page,
        size,
        totalElements,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1
      };
    }

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (title) params.append('title', title);
    if (assigneeId) params.append('assigneeId', assigneeId);
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('direction', direction);

    const res = await authFetch(`/api/tasks?${params.toString()}`);
    return handleResponse(res);
  },

  async getById(id) {
    if (ApiConfig.isDemoMode) {
      const task = mockTasks.find(t => t.id === Number(id));
      if (!task) throw new Error(`Task with ID ${id} not found`);
      return task;
    }
    const res = await authFetch(`/api/tasks/${id}`);
    return handleResponse(res);
  },

  async create(payload) {
    checkDemoAdminPermission('create a task');

    if (ApiConfig.isDemoMode) {
      const newId = mockTasks.length > 0 ? Math.max(...mockTasks.map(t => t.id)) + 1 : 1;
      const newTask = {
        id: newId,
        title: payload.title.trim(),
        description: payload.description ? payload.description.trim() : '',
        status: 'TODO',
        assignees: []
      };
      mockTasks.unshift(newTask);
      saveMockState();
      return newTask;
    }

    const res = await authFetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async update(id, payload) {
    checkDemoAdminPermission('update a task');

    if (ApiConfig.isDemoMode) {
      const idx = mockTasks.findIndex(t => t.id === Number(id));
      if (idx === -1) throw new Error(`Task with ID ${id} not found`);
      mockTasks[idx] = {
        ...mockTasks[idx],
        title: payload.title.trim(),
        description: payload.description ? payload.description.trim() : ''
      };
      saveMockState();
      return mockTasks[idx];
    }

    const res = await authFetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async updateStatus(id, status) {
    checkDemoAdminPermission('update task status');

    if (ApiConfig.isDemoMode) {
      const idx = mockTasks.findIndex(t => t.id === Number(id));
      if (idx === -1) throw new Error(`Task with ID ${id} not found`);
      mockTasks[idx].status = status;
      saveMockState();
      return mockTasks[idx];
    }

    const res = await authFetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async delete(id) {
    checkDemoAdminPermission('delete a task');

    if (ApiConfig.isDemoMode) {
      mockTasks = mockTasks.filter(t => t.id !== Number(id));
      saveMockState();
      return true;
    }
    const res = await authFetch(`/api/tasks/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async assign(taskId, employeeId) {
    checkDemoAdminPermission('assign tasks');

    if (ApiConfig.isDemoMode) {
      const task = mockTasks.find(t => t.id === Number(taskId));
      if (!task) throw new Error('Task not found');
      const emp = mockEmployees.find(e => e.id === Number(employeeId));
      if (!emp) throw new Error('Employee not found');

      if (!task.assignees.some(a => a.id === emp.id)) {
        task.assignees.push({ id: emp.id, name: emp.name });
      }
      saveMockState();
      return task;
    }

    const res = await authFetch(`/api/tasks/${taskId}/assignees/${employeeId}`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  async unassign(taskId, employeeId) {
    checkDemoAdminPermission('unassign tasks');

    if (ApiConfig.isDemoMode) {
      const task = mockTasks.find(t => t.id === Number(taskId));
      if (!task) throw new Error('Task not found');
      task.assignees = task.assignees.filter(a => a.id !== Number(employeeId));
      saveMockState();
      return true;
    }

    const res = await authFetch(`/api/tasks/${taskId}/assignees/${employeeId}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};
