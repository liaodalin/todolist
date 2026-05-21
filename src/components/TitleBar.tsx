// src/components/TitleBar.tsx

import React, { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface Props {
  onExpand: () => void;
  onHide: () => void;
}

export const TitleBar: React.FC<Props> = ({ onExpand, onHide }) => {
  const handleMouseDown = useCallback(async (e: React.MouseEvent) => {
    // Only drag on left mouse button, not on buttons
    if (e.button === 0 && (e.target as HTMLElement).tagName !== 'BUTTON') {
      try {
        await getCurrentWindow().startDragging();
      } catch (err) {
        console.error("Failed to start dragging:", err);
      }
    }
  }, []);

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        cursor: "move",
        userSelect: "none",
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
        Todolist
      </span>
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={onHide}
          onMouseDown={(e) => e.stopPropagation()}
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
          隐藏
        </button>
        <button
          onClick={onExpand}
          onMouseDown={(e) => e.stopPropagation()}
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
    </div>
  );
};
