// src/components/TitleBar.tsx

import React from "react";

interface Props {
  onExpand: () => void;
}

export const TitleBar: React.FC<Props> = ({ onExpand }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        cursor: "move",
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
        Todolist
      </span>
      <button
        onClick={onExpand}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontSize: 12,
          padding: "4px 8px",
          borderRadius: 4,
        }}
      >
        展开
      </button>
    </div>
  );
};
