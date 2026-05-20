// src/App.tsx

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ThemeProvider } from "./components/ThemeProvider";
import type { AppData, Theme, Mode } from "./types";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "./types";

function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [theme, setTheme] = useState<Theme>("colorful");
  const [mode, setMode] = useState<Mode>("mini");

  useEffect(() => {
    invoke<AppData>("load_data").then((loaded) => {
      const fullData: AppData = {
        tasks: loaded.tasks || [],
        categories: loaded.categories?.length ? loaded.categories : DEFAULT_CATEGORIES,
        settings: { ...DEFAULT_SETTINGS, ...loaded.settings },
      };
      setData(fullData);
      setTheme(fullData.settings.theme as Theme);
      setMode(fullData.settings.mode as Mode);
    });
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <ThemeProvider theme={theme} setTheme={setTheme}>
      <div className="app">
        {mode === "mini" ? (
          <div>Mini Mode (TODO)</div>
        ) : (
          <div>Full Mode (TODO)</div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
