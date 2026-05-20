import { useState, useCallback } from "react";
import type { Task, AppData } from "../types";

interface UseTasksProps {
  data: AppData;
  onSave: (data: AppData) => Promise<void>;
}

export function useTasks({ data, onSave }: UseTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(data.tasks || []);

  const addTask = useCallback(
    async (title: string, category: string, dueDate?: string) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        category,
        dueDate,
        status: "todo",
        createdAt: new Date().toISOString(),
      };
      const newTasks = [...tasks, newTask];
      setTasks(newTasks);
      await onSave({ ...data, tasks: newTasks });
      return newTask;
    },
    [tasks, data, onSave]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      const newTasks = tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      setTasks(newTasks);
      await onSave({ ...data, tasks: newTasks });
    },
    [tasks, data, onSave]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const newTasks = tasks.filter((t) => t.id !== id);
      setTasks(newTasks);
      await onSave({ ...data, tasks: newTasks });
    },
    [tasks, data, onSave]
  );

  const moveTask = useCallback(
    async (id: string, status: Task["status"]) => {
      const newTasks = tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completedAt: status === "done" ? new Date().toISOString() : t.completedAt,
            }
          : t
      );
      setTasks(newTasks);
      await onSave({ ...data, tasks: newTasks });
    },
    [tasks, data, onSave]
  );

  const getTasksByStatus = useCallback(
    (status: Task["status"]) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  const getTasksByCategory = useCallback(
    (categoryId: string) =>
      categoryId === "all"
        ? tasks
        : tasks.filter((t) => t.category === categoryId),
    [tasks]
  );

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByStatus,
    getTasksByCategory,
  };
}
