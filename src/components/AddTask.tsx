// src/components/AddTask.tsx

import React, { useState } from "react";
import type { Category, Task } from "../types";

interface Props {
  categories: Category[];
  onAdd: (title: string, category: string, dueDate?: string) => Promise<Task>;
}

export const AddTask: React.FC<Props> = ({ categories, onAdd }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]?.id || "");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd(title.trim(), category, dueDate || undefined);
    setTitle("");
    setDueDate("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: 8,
        padding: 12,
        borderTop: "1px solid var(--input-border)",
      }}
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="添加任务..."
        style={{
          flex: 1,
          padding: "6px 10px",
          border: "1px solid var(--input-border)",
          borderRadius: 6,
          background: "var(--input-bg)",
          color: "var(--text-primary)",
          fontSize: 13,
          outline: "none",
        }}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          padding: "6px 8px",
          border: "1px solid var(--input-border)",
          borderRadius: 6,
          background: "var(--input-bg)",
          color: "var(--text-primary)",
          fontSize: 12,
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
          padding: "6px 8px",
          border: "1px solid var(--input-border)",
          borderRadius: 6,
          background: "var(--input-bg)",
          color: "var(--text-primary)",
          fontSize: 12,
        }}
      />
      <button
        type="submit"
        style={{
          padding: "6px 12px",
          border: "none",
          borderRadius: 6,
          background: "var(--accent-done)",
          color: "#fff",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        +
      </button>
    </form>
  );
};
