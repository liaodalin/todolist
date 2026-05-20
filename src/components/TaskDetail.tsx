import React, { useState } from "react";
import type { Task, Category } from "../types";

interface Props {
  task: Task;
  categories: Category[];
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export const TaskDetail: React.FC<Props> = ({
  task,
  categories,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState(task.category);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [status, setStatus] = useState(task.status);

  const handleSave = async () => {
    await onUpdate(task.id, {
      title,
      category,
      dueDate: dueDate || undefined,
      status: status as Task["status"],
      completedAt: status === "done" ? new Date().toISOString() : undefined,
    });
    onClose();
  };

  const handleDelete = async () => {
    await onDelete(task.id);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg)",
          borderRadius: 12,
          padding: 24,
          width: 320,
          border: "var(--card-border)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <h3 style={{ marginBottom: 16, color: "var(--text-primary)" }}>编辑任务</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            marginBottom: 12,
            border: "1px solid var(--input-border)",
            borderRadius: 6,
            background: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            marginBottom: 12,
            border: "1px solid var(--input-border)",
            borderRadius: 6,
            background: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            marginBottom: 12,
            border: "1px solid var(--input-border)",
            borderRadius: 6,
            background: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Task["status"])}
          style={{
            width: "100%",
            padding: "8px 12px",
            marginBottom: 16,
            border: "1px solid var(--input-border)",
            borderRadius: 6,
            background: "var(--input-bg)",
            color: "var(--text-primary)",
          }}
        >
          <option value="todo">待办</option>
          <option value="doing">进行中</option>
          <option value="done">已完成</option>
        </select>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "8px 16px",
              border: "none",
              borderRadius: 6,
              background: "var(--accent-done)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            保存
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: 6,
              background: "var(--accent-todo)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
};
