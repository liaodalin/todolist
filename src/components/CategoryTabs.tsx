// src/components/CategoryTabs.tsx

import React from "react";
import type { Category } from "../types";

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryTabs: React.FC<Props> = ({ categories, selected, onSelect }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "0 12px",
        overflowX: "auto",
      }}
    >
      <button
        onClick={() => onSelect("all")}
        style={{
          padding: "4px 12px",
          borderRadius: 12,
          border: "none",
          background: selected === "all" ? "var(--accent-doing)" : "var(--input-bg)",
          color: selected === "all" ? "#fff" : "var(--text-primary)",
          cursor: "pointer",
          fontSize: 12,
          whiteSpace: "nowrap",
        }}
      >
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          style={{
            padding: "4px 12px",
            borderRadius: 12,
            border: "none",
            background: selected === cat.id ? cat.color : "var(--input-bg)",
            color: selected === cat.id ? "#fff" : "var(--text-primary)",
            cursor: "pointer",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
