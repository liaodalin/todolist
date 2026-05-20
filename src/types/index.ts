export interface Task {
  id: string;
  title: string;
  category: string;
  dueDate?: string;
  status: "todo" | "doing" | "done";
  createdAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export type Theme = "colorful" | "glass" | "minimal" | "dark";
export type Layout = "list" | "grid" | "kanban";
export type Mode = "mini" | "full";

export interface Settings {
  theme: Theme;
  layout: Layout;
  mode: Mode;
}

export interface AppData {
  tasks: Task[];
  categories: Category[];
  settings: Settings;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-work", name: "工作", color: "#ff6b6b", isDefault: true },
  { id: "cat-life", name: "生活", color: "#ffa502", isDefault: true },
  { id: "cat-study", name: "学习", color: "#2ed573", isDefault: true },
];

export const DEFAULT_SETTINGS: Settings = {
  theme: "colorful",
  layout: "list",
  mode: "mini",
};
