// src/components/TaskList.tsx

import React from "react";
import type { Task } from "../types";

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onClick: (task: Task) => void;
}

function formatDueDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.floor((target.getTime() - today.getTime()) / 86400000);

  if (diff < 0) return "已过期";
  if (diff === 0) return "今天";
  if (diff === 1) return "明天";
  if (diff <= 7) return `周${"日一二三四五六"[date.getDay()]}`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export const TaskList: React.FC<Props> = ({ tasks, onToggle, onClick }) => {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
      {tasks.map((task) => {
        const isOverdue =
          task.dueDate &&
          task.status !== "done" &&
          new Date(task.dueDate) < new Date();

        return (
          <div
            key={task.id}
            onClick={() => onClick(task)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 0",
              borderBottom: "1px solid var(--input-border)",
              cursor: "pointer",
            }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggle(task.id);
              }}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: `2px solid ${task.status === "done" ? "var(--accent-done)" : "var(--accent-todo)"}`,
                background: task.status === "done" ? "var(--accent-done)" : "transparent",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                flex: 1,
                textDecoration: task.status === "done" ? "line-through" : "none",
                color: isOverdue ? "var(--accent-todo)" : "var(--text-primary)",
                fontSize: 13,
              }}
            >
              {task.title}
            </span>
            {task.dueDate && (
              <span
                style={{
                  fontSize: 11,
                  color: isOverdue ? "var(--accent-todo)" : "var(--text-secondary)",
                }}
              >
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
