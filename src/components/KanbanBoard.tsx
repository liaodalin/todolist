import React from "react";
import type { Task, Category } from "../types";

interface Props {
  tasks: Task[];
  categories: Category[];
  onMoveTask: (id: string, status: Task["status"]) => Promise<void>;
  onClickTask: (task: Task) => void;
}

interface Column {
  id: Task["status"];
  title: string;
  color: string;
}

const columns: Column[] = [
  { id: "todo", title: "待办", color: "var(--accent-todo)" },
  { id: "doing", title: "进行中", color: "var(--accent-doing)" },
  { id: "done", title: "已完成", color: "var(--accent-done)" },
];

export const KanbanBoard: React.FC<Props> = ({
  tasks,
  categories,
  onMoveTask,
  onClickTask,
}) => {
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDrop = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onMoveTask(taskId, status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flex: 1,
        overflowX: "auto",
        padding: 12,
      }}
    >
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
            style={{
              flex: 1,
              minWidth: 200,
              background: "var(--hover-bg)",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                {col.title}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {columnTasks.length}
              </span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {columnTasks.map((task) => {
                const cat = categories.find((c) => c.id === task.category);
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onClickTask(task)}
                    style={{
                      background: "var(--card-bg)",
                      border: "var(--card-border)",
                      borderRadius: 6,
                      padding: 10,
                      cursor: "grab",
                      boxShadow: "var(--card-shadow)",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>
                      {task.title}
                    </div>
                    {cat && (
                      <span style={{ fontSize: 11, color: cat.color }}>{cat.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
