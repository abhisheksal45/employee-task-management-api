// Initial seed data reflecting the Spring Boot models and relations
export const initialDepartments = [
  { id: 1, name: "Engineering", employeeCount: 3 },
  { id: 2, name: "Product Design", employeeCount: 2 },
  { id: 3, name: "Marketing", employeeCount: 1 },
  { id: 4, name: "Human Resources", employeeCount: 1 },
  { id: 5, name: "Quality Assurance", employeeCount: 1 }
];

export const initialEmployees = [
  { id: 1, name: "Rahul Sharma", departmentId: 1, departmentName: "Engineering" },
  { id: 2, name: "Priya Patel", departmentId: 1, departmentName: "Engineering" },
  { id: 3, name: "Arjun Verma", departmentId: 1, departmentName: "Engineering" },
  { id: 4, name: "Ananya Iyer", departmentId: 2, departmentName: "Product Design" },
  { id: 5, name: "Vikram Malhotra", departmentId: 2, departmentName: "Product Design" },
  { id: 6, name: "Sneha Rao", departmentId: 3, departmentName: "Marketing" },
  { id: 7, name: "Rohan Gupta", departmentId: 4, departmentName: "Human Resources" },
  { id: 8, name: "Deepak Nair", departmentId: 5, departmentName: "Quality Assurance" }
];

export const initialTasks = [
  {
    id: 1,
    title: "Implement OAuth2 / JWT Authentication",
    description: "Build secure token verification middleware and role-based access control.",
    status: "IN_PROGRESS",
    assignees: [
      { id: 1, name: "Rahul Sharma" },
      { id: 2, name: "Priya Patel" }
    ]
  },
  {
    id: 2,
    title: "Design Design System & UI Kit",
    description: "Create component guidelines, dark mode tokens, and typography scale.",
    status: "DONE",
    assignees: [
      { id: 4, name: "Ananya Iyer" }
    ]
  },
  {
    id: 3,
    title: "Database Query Optimization & Indexing",
    description: "Analyze slow queries on employee task join tables and add compound indexes.",
    status: "TODO",
    assignees: [
      { id: 3, name: "Arjun Verma" }
    ]
  },
  {
    id: 4,
    title: "Create Interactive Kanban Board",
    description: "Enable smooth drag & drop or quick-advance status changes for sprint tasks.",
    status: "IN_PROGRESS",
    assignees: [
      { id: 1, name: "Rahul Sharma" },
      { id: 5, name: "Vikram Malhotra" }
    ]
  },
  {
    id: 5,
    title: "Prepare Q4 Brand Marketing Campaign",
    description: "Coordinate product release newsletter, press release, and social banners.",
    status: "TODO",
    assignees: [
      { id: 6, name: "Sneha Rao" }
    ]
  },
  {
    id: 6,
    title: "End-to-End API Integration Testing",
    description: "Run automated regression suite across Department, Employee, and Task endpoints.",
    status: "DONE",
    assignees: [
      { id: 8, name: "Deepak Nair" }
    ]
  }
];
