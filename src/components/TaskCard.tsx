import React from "react";
import type { Task, Category } from "../types";

interface Props {
  task: Task;
  category?: Category;
  onClick: (task: Task) => void;
}

export const TaskCard: React.FC<Props> = ({ task, category, onClick }) => {
  const isOverdue =
    task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  return (
    <div
      onClick={() => onClick(task)}
      style={{
        background: "var(--card-bg)",
        border: "var(--card-border)",
        borderRadius: 8,
        padding: 12,
        boxShadow: "var(--card-shadow)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: category?.color || "var(--accent-doing)",
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-primary)",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {task.title}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {category && (
          <span
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              background: "var(--hover-bg)",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            {category.name}
          </span>
        )}
        {task.dueDate && (
          <span
            style={{
              fontSize: 11,
              color: isOverdue ? "var(--accent-todo)" : "var(--text-secondary)",
            }}
          >
            {new Date(task.dueDate).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
};
