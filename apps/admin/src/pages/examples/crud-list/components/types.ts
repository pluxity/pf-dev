export interface UserBase {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
}

// DataTable에서 사용하기 위해 index signature 추가
export interface User extends UserBase {
  [key: string]: unknown;
}

export type UserFormData = Omit<UserBase, "id">;

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
