// src/App.tsx

import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ThemeProvider } from "./components/ThemeProvider";
import { MiniMode } from "./components/MiniMode";
import { FullMode } from "./components/FullMode";
import { useWindow } from "./hooks/useWindow";
import type { AppData, Theme, Layout, Mode, Task } from "./types";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "./types";

function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [theme, setTheme] = useState<Theme>("colorful");
  const [layout, setLayout] = useState<Layout>("list");
  const [mode, setMode] = useState<Mode>("mini");
  const { switchMode } = useWindow();

  useEffect(() => {
    invoke<AppData>("load_data").then((loaded) => {
      const fullData: AppData = {
        tasks: loaded.tasks || [],
        categories: loaded.categories?.length ? loaded.categories : DEFAULT_CATEGORIES,
        settings: { ...DEFAULT_SETTINGS, ...loaded.settings },
      };
      setData(fullData);
      setTheme(fullData.settings.theme as Theme);
      setLayout(fullData.settings.layout as Layout);
      setMode(fullData.settings.mode as Mode);
    });
  }, []);

  const saveData = useCallback(
    async (newData: AppData) => {
      setData(newData);
      await invoke("save_data", { data: newData });
    },
    []
  );

  const addTask = useCallback(
    async (title: string, category: string, dueDate?: string) => {
      if (!data) return {} as Task;
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        category,
        dueDate,
        status: "todo",
        createdAt: new Date().toISOString(),
      };
      const newData = { ...data, tasks: [...data.tasks, newTask] };
      await saveData(newData);
      return newTask;
    },
    [data, saveData]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      if (!data) return;
      const task = data.tasks.find((t) => t.id === id);
      if (!task) return;
      const newStatus = task.status === "done" ? "todo" : "done";
      const newData = {
        ...data,
        tasks: data.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: newStatus as Task["status"],
                completedAt: newStatus === "done" ? new Date().toISOString() : undefined,
              }
            : t
        ),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      if (!data) return;
      const newData = {
        ...data,
        tasks: data.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (!data) return;
      const newData = { ...data, tasks: data.tasks.filter((t) => t.id !== id) };
      await saveData(newData);
    },
    [data, saveData]
  );

  const moveTask = useCallback(
    async (id: string, status: Task["status"]) => {
      if (!data) return;
      const newData = {
        ...data,
        tasks: data.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status,
                completedAt: status === "done" ? new Date().toISOString() : t.completedAt,
              }
            : t
        ),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const handleSwitchMode = useCallback(
    async (newMode: Mode) => {
      setMode(newMode);
      await switchMode(newMode);
      if (data) {
        await saveData({ ...data, settings: { ...data.settings, mode: newMode } });
      }
    },
    [data, saveData, switchMode]
  );

  const handleChangeTheme = useCallback(
    async (newTheme: Theme) => {
      setTheme(newTheme);
      if (data) {
        await saveData({ ...data, settings: { ...data.settings, theme: newTheme } });
      }
    },
    [data, saveData]
  );

  const handleChangeLayout = useCallback(
    async (newLayout: Layout) => {
      setLayout(newLayout);
      if (data) {
        await saveData({ ...data, settings: { ...data.settings, layout: newLayout } });
      }
    },
    [data, saveData]
  );

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <span style={{ color: "var(--text-secondary)" }}>加载中...</span>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme} setTheme={handleChangeTheme}>
      {mode === "mini" ? (
        <MiniMode
          tasks={data.tasks}
          categories={data.categories}
          onExpand={() => handleSwitchMode("full")}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onClickTask={() => handleSwitchMode("full")}
        />
      ) : (
        <FullMode
          tasks={data.tasks}
          categories={data.categories}
          theme={theme}
          layout={layout}
          onCollapse={() => handleSwitchMode("mini")}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onChangeTheme={handleChangeTheme}
          onChangeLayout={handleChangeLayout}
          onMoveTask={moveTask}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
