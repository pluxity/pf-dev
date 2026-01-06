export interface Item {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  status: "active" | "inactive" | "draft";
  createdAt: string;
  updatedAt: string;
}

export interface ItemFormData {
  title: string;
  description: string;
  thumbnail?: string;
  status: "active" | "inactive" | "draft";
}

export type FilterStatus = "all" | "active" | "inactive" | "draft";
