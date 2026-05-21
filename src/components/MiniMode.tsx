// src/components/MiniMode.tsx

import React, { useCallback, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TitleBar } from "./TitleBar";
import { CategoryTabs } from "./CategoryTabs";
import { TaskList } from "./TaskList";
import { AddTask } from "./AddTask";
import type { Task, Category } from "../types";

interface Props {
  tasks: Task[];
  categories: Category[];
  onExpand: () => void;
  onAddTask: (title: string, category: string, dueDate?: string) => Promise<Task>;
  onToggleTask: (id: string) => void;
  onClickTask: (task: Task) => void;
}

export const MiniMode: React.FC<Props> = ({
  tasks,
  categories,
  onExpand,
  onAddTask,
  onToggleTask,
  onClickTask,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleHide = useCallback(async () => {
    try {
      await getCurrentWindow().hide();
    } catch (err) {
      console.error("Failed to hide window:", err);
    }
  }, []);

  const filteredTasks =
    selectedCategory === "all"
      ? tasks
      : tasks.filter((t) => t.category === selectedCategory);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg-gradient)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <TitleBar onExpand={onExpand} onHide={handleHide} />
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <TaskList tasks={filteredTasks} onToggle={onToggleTask} onClick={onClickTask} />
      <AddTask categories={categories} onAdd={onAddTask} mini />
    </div>
  );
};
