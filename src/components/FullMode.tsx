import React, { useState } from "react";
import { CategoryTabs } from "./CategoryTabs";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";
import { KanbanBoard } from "./KanbanBoard";
import { AddTask } from "./AddTask";
import { TaskDetail } from "./TaskDetail";
import { Settings } from "./Settings";
import type { Task, Category, Theme, Layout } from "../types";

interface Props {
  tasks: Task[];
  categories: Category[];
  theme: Theme;
  layout: Layout;
  onCollapse: () => void;
  onAddTask: (title: string, category: string, dueDate?: string) => Promise<Task>;
  onToggleTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onChangeTheme: (theme: Theme) => void;
  onChangeLayout: (layout: Layout) => void;
  onMoveTask: (id: string, status: Task["status"]) => Promise<void>;
}

export const FullMode: React.FC<Props> = ({
  tasks,
  categories,
  theme,
  layout,
  onCollapse,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onChangeTheme,
  onChangeLayout,
  onMoveTask,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid var(--input-border)",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>
          Todolist
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: "4px 12px",
              border: "none",
              borderRadius: 6,
              background: "var(--input-bg)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            设置
          </button>
          <button
            onClick={onCollapse}
            style={{
              padding: "4px 12px",
              border: "none",
              borderRadius: 6,
              background: "var(--input-bg)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            收起
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        {layout === "kanban" ? (
          <KanbanBoard
            tasks={filteredTasks}
            categories={categories}
            onMoveTask={onMoveTask}
            onClickTask={setSelectedTask}
          />
        ) : layout === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
              padding: 12,
              overflowY: "auto",
              flex: 1,
            }}
          >
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                category={categories.find((c) => c.id === task.category)}
                onClick={setSelectedTask}
              />
            ))}
          </div>
        ) : (
          <TaskList tasks={filteredTasks} onToggle={onToggleTask} onClick={setSelectedTask} />
        )}
        <AddTask categories={categories} onAdd={onAddTask} />
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          categories={categories}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
      {showSettings && (
        <Settings
          theme={theme}
          layout={layout}
          onChangeTheme={onChangeTheme}
          onChangeLayout={onChangeLayout}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};
