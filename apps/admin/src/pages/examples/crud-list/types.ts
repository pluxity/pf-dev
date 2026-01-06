export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  createdAt: string;
  updatedAt: string;
  // DataTable 호환을 위한 index signature
  [key: string]: string;
}

export interface UserFormData {
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
}

export type FilterStatus = "all" | "active" | "inactive" | "pending";

export const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Sales", "HR"] as const;

export const ROLES = [
  "Developer",
  "Designer",
  "Manager",
  "Analyst",
  "Specialist",
  "Lead",
  "Director",
  "Intern",
] as const;

export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
] as const;
