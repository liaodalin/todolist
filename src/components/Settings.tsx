import React from "react";
import type { Theme, Layout } from "../types";

interface Props {
  theme: Theme;
  layout: Layout;
  onChangeTheme: (theme: Theme) => void;
  onChangeLayout: (layout: Layout) => void;
  onClose: () => void;
}

export const Settings: React.FC<Props> = ({
  theme,
  layout,
  onChangeTheme,
  onChangeLayout,
  onClose,
}) => {
  const themes: { id: Theme; name: string }[] = [
    { id: "colorful", name: "活泼彩色" },
    { id: "glass", name: "毛玻璃" },
    { id: "minimal", name: "极简扁平" },
    { id: "dark", name: "暗色" },
  ];

  const layouts: { id: Layout; name: string }[] = [
    { id: "list", name: "列表" },
    { id: "grid", name: "卡片" },
    { id: "kanban", name: "看板" },
  ];

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
          width: 300,
          border: "var(--card-border)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <h3 style={{ marginBottom: 16, color: "var(--text-primary)" }}>设置</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, color: "var(--text-secondary)", fontSize: 13 }}>
            主题
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onChangeTheme(t.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: theme === t.id ? "2px solid var(--accent-doing)" : "1px solid var(--input-border)",
                  background: theme === t.id ? "var(--hover-bg)" : "var(--input-bg)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 8, color: "var(--text-secondary)", fontSize: 13 }}>
            布局
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {layouts.map((l) => (
              <button
                key={l.id}
                onClick={() => onChangeLayout(l.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: layout === l.id ? "2px solid var(--accent-doing)" : "1px solid var(--input-border)",
                  background: layout === l.id ? "var(--hover-bg)" : "var(--input-bg)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
