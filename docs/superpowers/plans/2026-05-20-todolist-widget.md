# Todolist 桌面挂件 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight desktop todolist widget with Tauri v2, supporting mini/full modes, 4 themes, 3 layouts, and local JSON storage.

**Architecture:** Single Tauri window with mode switching (mini/full). React frontend with CSS variables for theming. Rust backend handles window management, file storage, and system tray.

**Tech Stack:** Tauri v2, React 18, TypeScript, Vite, CSS Modules

---

## File Structure

```
d:\ai\todolist\
├── src-tauri/
│   ├── src/
│   │   ├── main.rs              # Tauri entry, registers commands
│   │   ├── commands.rs          # invoke handlers (window, data, tray)
│   │   ├── storage.rs           # JSON file read/write
│   │   └── tray.rs              # System tray setup
│   ├── Cargo.toml
│   ├── tauri.conf.json          # Tauri config (window, security)
│   └── capabilities/
│       └── default.json         # Permissions
├── src/
│   ├── main.tsx                 # React entry
│   ├── App.tsx                  # Root: mode routing, data loading
│   ├── types/
│   │   └── index.ts             # Task, Category, Settings, AppData
│   ├── hooks/
│   │   ├── useTasks.ts          # Task CRUD + persistence
│   │   ├── useCategories.ts     # Category management
│   │   ├── useSettings.ts       # Theme/layout/mode settings
│   │   └── useWindow.ts         # Tauri window invoke wrappers
│   ├── components/
│   │   ├── MiniMode.tsx         # Mini mode container
│   │   ├── FullMode.tsx         # Full mode container
│   │   ├── TaskList.tsx         # List view
│   │   ├── TaskCard.tsx         # Card component
│   │   ├── KanbanBoard.tsx      # Kanban view with drag-drop
│   │   ├── CategoryTabs.tsx     # Category filter tabs
│   │   ├── AddTask.tsx          # Add task form
│   │   ├── TaskDetail.tsx       # Task detail/edit panel
│   │   ├── Settings.tsx         # Settings panel
│   │   ├── ThemeProvider.tsx    # CSS variable injection
│   │   └── TitleBar.tsx         # Custom title bar for mini mode
│   └── styles/
│       ├── themes/
│       │   ├── colorful.css     # 活泼彩色
│       │   ├── glass.css        # 毛玻璃
│       │   ├── minimal.css      # 极简扁平
│       │   └── dark.css         # 暗色主题
│       └── global.css           # Base styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`
- Create: `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/default.json`
- Create: `src-tauri/src/main.rs`

- [ ] **Step 1: Initialize npm project**

```bash
cd d:\ai\todolist
npm init -y
```

- [ ] **Step 2: Install dependencies**

```bash
npm install react react-dom @tauri-apps/api@^2
npm install -D typescript @types/react @types/react-dom vite @vitejs/plugin-react @tauri-apps/cli@^2
```

- [ ] **Step 3: Create package.json scripts**

```json
{
  "name": "todolist-widget",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri": "tauri"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@tauri-apps/api": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "@tauri-apps/cli": "^2.0.0"
  }
}
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: ["es2021", "chrome100", "safari13"],
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

- [ ] **Step 6: Create index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todolist</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create .gitignore**

```
node_modules/
dist/
src-tauri/target/
*.log
```

- [ ] **Step 8: Initialize Tauri project**

```bash
npx tauri init --app-name todolist --window-title "Todolist" --dev-url http://localhost:1420 --before-dev-command "npm run dev" --before-build-command "npm run build" --frontend-dist ../dist
```

- [ ] **Step 9: Update src-tauri/Cargo.toml**

```toml
[package]
name = "todolist"
version = "0.1.0"
edition = "2021"

[lib]
name = "todolist_lib"
crate-type = ["lib", "cdylib", "staticlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = ["tray-icon"] }
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
chrono = { version = "0.4", features = ["serde"] }
dirs = "5"
```

- [ ] **Step 10: Create src-tauri/tauri.conf.json**

```json
{
  "$schema": "https://raw.githubusercontent.com/nodnarbnitram/tauri-v2/main/crates/tauri-cli/config.schema.json",
  "productName": "Todolist",
  "version": "0.1.0",
  "identifier": "com.todolist.widget",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:1420",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "title": "Todolist",
        "width": 320,
        "height": 480,
        "resizable": false,
        "decorations": false,
        "transparent": true,
        "alwaysOnTop": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

- [ ] **Step 11: Create src-tauri/capabilities/default.json**

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-set-size",
    "core:window:allow-set-always-on-top",
    "core:window:allow-set-decorations",
    "core:window:allow-show",
    "core:window:allow-hide",
    "core:window:allow-close",
    "shell:allow-open"
  ]
}
```

- [ ] **Step 12: Create src-tauri/src/main.rs**

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    todolist_lib::run();
}
```

- [ ] **Step 13: Create src-tauri/src/lib.rs**

```rust
mod commands;
mod storage;
mod tray;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            tray::create_tray(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::load_data,
            commands::save_data,
            commands::set_mini_mode,
            commands::set_full_mode,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 14: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Tauri v2 + React project"
```

---

## Task 2: TypeScript Types & Data Model

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create type definitions**

```typescript
// src/types/index.ts

export interface Task {
  id: string;
  title: string;
  category: string;
  dueDate?: string;
  status: "todo" | "doing" | "done";
  createdAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export type Theme = "colorful" | "glass" | "minimal" | "dark";
export type Layout = "list" | "grid" | "kanban";
export type Mode = "mini" | "full";

export interface Settings {
  theme: Theme;
  layout: Layout;
  mode: Mode;
}

export interface AppData {
  tasks: Task[];
  categories: Category[];
  settings: Settings;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-work", name: "工作", color: "#ff6b6b", isDefault: true },
  { id: "cat-life", name: "生活", color: "#ffa502", isDefault: true },
  { id: "cat-study", name: "学习", color: "#2ed573", isDefault: true },
];

export const DEFAULT_SETTINGS: Settings = {
  theme: "colorful",
  layout: "list",
  mode: "mini",
};
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: Rust Storage Layer

**Files:**
- Create: `src-tauri/src/storage.rs`

- [ ] **Step 1: Implement storage module**

```rust
// src-tauri/src/storage.rs

use crate::commands::AppData;
use std::fs;
use std::path::PathBuf;

fn get_data_path() -> PathBuf {
    let mut path = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("todolist-widget");
    fs::create_dir_all(&path).ok();
    path.push("data.json");
    path
}

pub fn load() -> AppData {
    let path = get_data_path();
    if path.exists() {
        let content = fs::read_to_string(&path).unwrap_or_default();
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppData::default()
    }
}

pub fn save(data: &AppData) -> Result<(), String> {
    let path = get_data_path();
    let json = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}
```

- [ ] **Step 2: Commit**

```bash
git add src-tauri/src/storage.rs
git commit -m "feat: implement JSON file storage"
```

---

## Task 4: Rust Commands & Tray

**Files:**
- Create: `src-tauri/src/commands.rs`
- Create: `src-tauri/src/tray.rs`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Create commands module**

```rust
// src-tauri/src/commands.rs

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub category: String,
    pub due_date: Option<String>,
    pub status: String,
    pub created_at: String,
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub color: String,
    pub is_default: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Settings {
    pub theme: String,
    pub layout: String,
    pub mode: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct AppData {
    pub tasks: Vec<Task>,
    pub categories: Vec<Category>,
    pub settings: Settings,
}

#[tauri::command]
pub fn load_data() -> AppData {
    crate::storage::load()
}

#[tauri::command]
pub fn save_data(data: AppData) -> Result<(), String> {
    crate::storage::save(&data)
}

#[tauri::command]
pub fn set_mini_mode(window: tauri::Window) -> Result<(), String> {
    window.set_size(tauri::Size::Logical(tauri::LogicalSize {
        width: 320.0,
        height: 480.0,
    })).map_err(|e| e.to_string())?;
    window.set_always_on_top(true).map_err(|e| e.to_string())?;
    window.set_decorations(false).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_full_mode(window: tauri::Window) -> Result<(), String> {
    window.set_size(tauri::Size::Logical(tauri::LogicalSize {
        width: 800.0,
        height: 600.0,
    })).map_err(|e| e.to_string())?;
    window.set_always_on_top(false).map_err(|e| e.to_string())?;
    window.set_decorations(true).map_err(|e| e.to_string())?;
    Ok(())
}
```

- [ ] **Step 2: Create tray module**

```rust
// src-tauri/src/tray.rs

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

pub fn create_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let show = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &quit])?;

    let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    window.show().ok();
                    window.set_focus().ok();
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        window.hide().ok();
                    } else {
                        window.show().ok();
                        window.set_focus().ok();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}
```

- [ ] **Step 3: Update lib.rs**

```rust
// src-tauri/src/lib.rs

mod commands;
mod storage;
mod tray;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            tray::create_tray(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::load_data,
            commands::save_data,
            commands::set_mini_mode,
            commands::set_full_mode,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 4: Create build.rs**

```rust
// src-tauri/build.rs

fn main() {
    tauri_build::build();
}
```

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/ src-tauri/build.rs
git commit -m "feat: add Tauri commands and system tray"
```

---

## Task 5: React Entry & Theme Provider

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/components/ThemeProvider.tsx`
- Create: `src/styles/global.css`
- Create: `src/styles/themes/colorful.css`
- Create: `src/styles/themes/glass.css`
- Create: `src/styles/themes/minimal.css`
- Create: `src/styles/themes/dark.css`

- [ ] **Step 1: Create global.css**

```css
/* src/styles/global.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  overflow: hidden;
  user-select: none;
}

#root {
  width: 100vw;
  height: 100vh;
}
```

- [ ] **Step 2: Create theme CSS files**

```css
/* src/styles/themes/colorful.css */

[data-theme="colorful"] {
  --bg-gradient: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  --card-bg: #ffffff;
  --card-border: none;
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --text-primary: #333333;
  --text-secondary: #666666;
  --accent-todo: #ff6b6b;
  --accent-doing: #ffa502;
  --accent-done: #2ed573;
  --input-bg: #ffffff;
  --input-border: #e0e0e0;
  --hover-bg: rgba(0, 0, 0, 0.05);
}
```

```css
/* src/styles/themes/glass.css */

[data-theme="glass"] {
  --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --card-bg: rgba(255, 255, 255, 0.15);
  --card-border: 1px solid rgba(255, 255, 255, 0.3);
  --card-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.8);
  --accent-todo: #ff6b6b;
  --accent-doing: #ffa502;
  --accent-done: #2ed573;
  --input-bg: rgba(255, 255, 255, 0.1);
  --input-border: rgba(255, 255, 255, 0.3);
  --hover-bg: rgba(255, 255, 255, 0.1);
}
```

```css
/* src/styles/themes/minimal.css */

[data-theme="minimal"] {
  --bg-gradient: #f5f5f5;
  --card-bg: #ffffff;
  --card-border: 1px solid #e8e8e8;
  --card-shadow: none;
  --text-primary: #222222;
  --text-secondary: #888888;
  --accent-todo: #999999;
  --accent-doing: #666666;
  --accent-done: #333333;
  --input-bg: #ffffff;
  --input-border: #e0e0e0;
  --hover-bg: rgba(0, 0, 0, 0.03);
}
```

```css
/* src/styles/themes/dark.css */

[data-theme="dark"] {
  --bg-gradient: #1a1a2e;
  --card-bg: #16213e;
  --card-border: 1px solid rgba(255, 255, 255, 0.1);
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --accent-todo: #ff6b6b;
  --accent-doing: #4dabf7;
  --accent-done: #51cf66;
  --input-bg: #0f3460;
  --input-border: rgba(255, 255, 255, 0.2);
  --hover-bg: rgba(255, 255, 255, 0.05);
}
```

- [ ] **Step 3: Create ThemeProvider**

```tsx
// src/components/ThemeProvider.tsx

import React, { createContext, useContext, useEffect } from "react";
import type { Theme } from "../types";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "colorful",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface Props {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<Props> = ({ theme, setTheme, children }) => {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

- [ ] **Step 4: Create main.tsx**

```tsx
// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./styles/themes/colorful.css";
import "./styles/themes/glass.css";
import "./styles/themes/minimal.css";
import "./styles/themes/dark.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 5: Create initial App.tsx**

```tsx
// src/App.tsx

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ThemeProvider } from "./components/ThemeProvider";
import type { AppData, Theme, Mode, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "./types";

function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [theme, setTheme] = useState<Theme>("colorful");
  const [mode, setMode] = useState<Mode>("mini");

  useEffect(() => {
    invoke<AppData>("load_data").then((loaded) => {
      setData(loaded);
      setTheme(loaded.settings.theme as Theme);
      setMode(loaded.settings.mode as Mode);
    });
  }, []);

  const saveData = async (newData: AppData) => {
    setData(newData);
    await invoke("save_data", { data: newData });
  };

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
```

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: add React entry, theme provider, and CSS themes"
```

---

## Task 6: Window Management Hooks

**Files:**
- Create: `src/hooks/useWindow.ts`
- Create: `src/hooks/useSettings.ts`

- [ ] **Step 1: Create useWindow hook**

```typescript
// src/hooks/useWindow.ts

import { invoke } from "@tauri-apps/api/core";
import type { Mode } from "../types";

export function useWindow() {
  const setMiniMode = async () => {
    await invoke("set_mini_mode");
  };

  const setFullMode = async () => {
    await invoke("set_full_mode");
  };

  const switchMode = async (mode: Mode) => {
    if (mode === "mini") {
      await setMiniMode();
    } else {
      await setFullMode();
    }
  };

  return { setMiniMode, setFullMode, switchMode };
}
```

- [ ] **Step 2: Create useSettings hook**

```typescript
// src/hooks/useSettings.ts

import { useState, useCallback } from "react";
import type { Settings, Theme, Layout, Mode, AppData } from "../types";
import { DEFAULT_SETTINGS } from "../types";

interface UseSettingsProps {
  data: AppData;
  onSave: (data: AppData) => Promise<void>;
}

export function useSettings({ data, onSave }: UseSettingsProps) {
  const [settings, setSettings] = useState<Settings>(data.settings || DEFAULT_SETTINGS);

  const updateTheme = useCallback(
    async (theme: Theme) => {
      const newSettings = { ...settings, theme };
      setSettings(newSettings);
      await onSave({ ...data, settings: newSettings });
    },
    [settings, data, onSave]
  );

  const updateLayout = useCallback(
    async (layout: Layout) => {
      const newSettings = { ...settings, layout };
      setSettings(newSettings);
      await onSave({ ...data, settings: newSettings });
    },
    [settings, data, onSave]
  );

  const updateMode = useCallback(
    async (mode: Mode) => {
      const newSettings = { ...settings, mode };
      setSettings(newSettings);
      await onSave({ ...data, settings: newSettings });
    },
    [settings, data, onSave]
  );

  return { settings, updateTheme, updateLayout, updateMode };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add window and settings hooks"
```

---

## Task 7: Task Management Hooks

**Files:**
- Create: `src/hooks/useTasks.ts`
- Create: `src/hooks/useCategories.ts`

- [ ] **Step 1: Create useTasks hook**

```typescript
// src/hooks/useTasks.ts

import { useState, useCallback } from "react";
import type { Task, AppData } from "../types";

interface UseTasksProps {
  data: AppData;
  onSave: (data: AppData) => Promise<void>;
}

export function useTasks({ data, onSave }: UseTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(data.tasks || []);

  const addTask = useCallback(
    async (title: string, category: string, dueDate?: string) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        category,
        dueDate,
        status: "todo",
        createdAt: new Date().toISOString(),
      };
      const newTasks = [...tasks, newTask];
      setTasks(newTasks);
      await onSave({ ...data, tasks: newTasks });
      return newTask;
    },
    [tasks, data, onSave]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      const newTasks = tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      setTasks(newTasks);
      await onSave({ ...data, tasks: newTasks });
    },
    [tasks, data, onSave]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const newTasks = tasks.filter((t) => t.id !== id);
      setTasks(newTasks);
      await onSave({ ...data, tasks: newTasks });
    },
    [tasks, data, onSave]
  );

  const moveTask = useCallback(
    async (id: string, status: Task["status"]) => {
      const newTasks = tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completedAt: status === "done" ? new Date().toISOString() : t.completedAt,
            }
          : t
      );
      setTasks(newTasks);
      await onSave({ ...data, tasks: newTasks });
    },
    [tasks, data, onSave]
  );

  const getTasksByStatus = useCallback(
    (status: Task["status"]) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  const getTasksByCategory = useCallback(
    (categoryId: string) =>
      categoryId === "all"
        ? tasks
        : tasks.filter((t) => t.category === categoryId),
    [tasks]
  );

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByStatus,
    getTasksByCategory,
  };
}
```

- [ ] **Step 2: Create useCategories hook**

```typescript
// src/hooks/useCategories.ts

import { useState, useCallback } from "react";
import type { Category, AppData } from "../types";
import { DEFAULT_CATEGORIES } from "../types";

interface UseCategoriesProps {
  data: AppData;
  onSave: (data: AppData) => Promise<void>;
}

export function useCategories({ data, onSave }: UseCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>(
    data.categories?.length ? data.categories : DEFAULT_CATEGORIES
  );

  const addCategory = useCallback(
    async (name: string, color: string) => {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name,
        color,
        isDefault: false,
      };
      const newCategories = [...categories, newCategory];
      setCategories(newCategories);
      await onSave({ ...data, categories: newCategories });
      return newCategory;
    },
    [categories, data, onSave]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const cat = categories.find((c) => c.id === id);
      if (cat?.isDefault) return false;
      const newCategories = categories.filter((c) => c.id !== id);
      setCategories(newCategories);
      await onSave({ ...data, categories: newCategories });
      return true;
    },
    [categories, data, onSave]
  );

  return { categories, addCategory, deleteCategory };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add task and category management hooks"
```

---

## Task 8: Mini Mode Component

**Files:**
- Create: `src/components/MiniMode.tsx`
- Create: `src/components/TitleBar.tsx`
- Create: `src/components/CategoryTabs.tsx`
- Create: `src/components/TaskList.tsx`

- [ ] **Step 1: Create TitleBar**

```tsx
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
        appRegion: "drag",
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
          appRegion: "no-drag",
        }}
      >
        展开
      </button>
    </div>
  );
};
```

- [ ] **Step 2: Create CategoryTabs**

```tsx
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
```

- [ ] **Step 3: Create TaskList**

```tsx
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
```

- [ ] **Step 4: Create MiniMode**

```tsx
// src/components/MiniMode.tsx

import React, { useState } from "react";
import { TitleBar } from "./TitleBar";
import { CategoryTabs } from "./CategoryTabs";
import { TaskList } from "./TaskList";
import { AddTask } from "./AddTask";
import type { Task, Category } from "../types";

interface Props {
  tasks: Task[];
  categories: Category[];
  onExpand: () => void;
  onAddTask: (title: string, category: string, dueDate?: string) => Promise<Task>;
  onToggleTask: (id: string) => void;
  onClickTask: (task: Task) => void;
}

export const MiniMode: React.FC<Props> = ({
  tasks,
  categories,
  onExpand,
  onAddTask,
  onToggleTask,
  onClickTask,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTasks =
    selectedCategory === "all"
      ? tasks
      : tasks.filter((t) => t.category === selectedCategory);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg-gradient)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <TitleBar onExpand={onExpand} />
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <TaskList tasks={filteredTasks} onToggle={onToggleTask} onClick={onClickTask} />
      <AddTask categories={categories} onAdd={onAddTask} />
    </div>
  );
};
```

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add mini mode with title bar, category tabs, and task list"
```

---

## Task 9: Add Task Component

**Files:**
- Create: `src/components/AddTask.tsx`

- [ ] **Step 1: Create AddTask**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AddTask.tsx
git commit -m "feat: add task creation form"
```

---

## Task 10: Full Mode with List View

**Files:**
- Create: `src/components/FullMode.tsx`
- Create: `src/components/TaskDetail.tsx`
- Create: `src/components/Settings.tsx`

- [ ] **Step 1: Create TaskDetail**

```tsx
// src/components/TaskDetail.tsx

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
      status,
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
```

- [ ] **Step 2: Create Settings**

```tsx
// src/components/Settings.tsx

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
```

- [ ] **Step 3: Create FullMode**

```tsx
// src/components/FullMode.tsx

import React, { useState } from "react";
import { CategoryTabs } from "./CategoryTabs";
import { TaskList } from "./TaskList";
import { AddTask } from "./AddTask";
import { TaskDetail } from "./TaskDetail";
import { Settings } from "./Settings";
import type { Task, Category, Theme, Layout } from "../types";

interface Props {
  tasks: Task[];
  categories: Category[];
  theme: Theme;
  layout: Layout;
  onCollapse: () => void;
  onAddTask: (title: string, category: string, dueDate?: string) => Promise<Task>;
  onToggleTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onChangeTheme: (theme: Theme) => void;
  onChangeLayout: (layout: Layout) => void;
}

export const FullMode: React.FC<Props> = ({
  tasks,
  categories,
  theme,
  layout,
  onCollapse,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onChangeTheme,
  onChangeLayout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const filteredTasks =
    selectedCategory === "all"
      ? tasks
      : tasks.filter((t) => t.category === selectedCategory);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg-gradient)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid var(--input-border)",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>
          Todolist
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: "4px 12px",
              border: "none",
              borderRadius: 6,
              background: "var(--input-bg)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            设置
          </button>
          <button
            onClick={onCollapse}
            style={{
              padding: "4px 12px",
              border: "none",
              borderRadius: 6,
              background: "var(--input-bg)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            收起
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <TaskList tasks={filteredTasks} onToggle={onToggleTask} onClick={setSelectedTask} />
        <AddTask categories={categories} onAdd={onAddTask} />
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          categories={categories}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
      {showSettings && (
        <Settings
          theme={theme}
          layout={layout}
          onChangeTheme={onChangeTheme}
          onChangeLayout={onChangeLayout}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};
```

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: add full mode with task detail and settings"
```

---

## Task 11: Card & Kanban Views

**Files:**
- Create: `src/components/TaskCard.tsx`
- Create: `src/components/KanbanBoard.tsx`

- [ ] **Step 1: Create TaskCard**

```tsx
// src/components/TaskCard.tsx

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
```

- [ ] **Step 2: Create KanbanBoard**

```tsx
// src/components/KanbanBoard.tsx

import React from "react";
import type { Task, Category } from "../types";

interface Props {
  tasks: Task[];
  categories: Category[];
  onMoveTask: (id: string, status: Task["status"]) => Promise<void>;
  onClickTask: (task: Task) => void;
}

interface Column {
  id: Task["status"];
  title: string;
  color: string;
}

const columns: Column[] = [
  { id: "todo", title: "待办", color: "var(--accent-todo)" },
  { id: "doing", title: "进行中", color: "var(--accent-doing)" },
  { id: "done", title: "已完成", color: "var(--accent-done)" },
];

export const KanbanBoard: React.FC<Props> = ({
  tasks,
  categories,
  onMoveTask,
  onClickTask,
}) => {
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDrop = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onMoveTask(taskId, status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flex: 1,
        overflowX: "auto",
        padding: 12,
      }}
    >
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
            style={{
              flex: 1,
              minWidth: 200,
              background: "var(--hover-bg)",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                {col.title}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {columnTasks.length}
              </span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {columnTasks.map((task) => {
                const cat = categories.find((c) => c.id === task.category);
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onClickTask(task)}
                    style={{
                      background: "var(--card-bg)",
                      border: "var(--card-border)",
                      borderRadius: 6,
                      padding: 10,
                      cursor: "grab",
                      boxShadow: "var(--card-shadow)",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>
                      {task.title}
                    </div>
                    {cat && (
                      <span style={{ fontSize: 11, color: cat.color }}>{cat.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 3: Update FullMode to support layouts**

Update `src/components/FullMode.tsx` to use the layout prop:

```tsx
// Add import at top
import { TaskCard } from "./TaskCard";
import { KanbanBoard } from "./KanbanBoard";

// Replace TaskList section in content with:
{layout === "kanban" ? (
  <KanbanBoard
    tasks={filteredTasks}
    categories={categories}
    onMoveTask={onMoveTask}
    onClickTask={setSelectedTask}
  />
) : layout === "grid" ? (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
      gap: 12,
      padding: 12,
      overflowY: "auto",
      flex: 1,
    }}
  >
    {filteredTasks.map((task) => (
      <TaskCard
        key={task.id}
        task={task}
        category={categories.find((c) => c.id === task.category)}
        onClick={setSelectedTask}
      />
    ))}
  </div>
) : (
  <TaskList tasks={filteredTasks} onToggle={onToggleTask} onClick={setSelectedTask} />
)}
```

Also add `onMoveTask` prop to FullMode interface and pass it through.

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: add card and kanban views with drag-drop"
```

---

## Task 12: Wire Up App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Complete App.tsx**

```tsx
// src/App.tsx

import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ThemeProvider } from "./components/ThemeProvider";
import { MiniMode } from "./components/MiniMode";
import { FullMode } from "./FullMode";
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
          onClickTask={(task) => {
            // In mini mode, switch to full to edit
            handleSwitchMode("full");
          }}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up app with all components and state management"
```

---

## Task 13: Test & Polish

**Files:**
- Modify: Various files as needed

- [ ] **Step 1: Build and test Rust backend**

```bash
cd src-tauri && cargo build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Build frontend**

```bash
npm run build
```

Expected: TypeScript compiles, Vite builds successfully.

- [ ] **Step 3: Run the app**

```bash
npm run tauri dev
```

Expected: App launches showing mini mode with the colorful theme.

- [ ] **Step 4: Test core features**

- Add a task with title, category, and due date
- Toggle task completion
- Switch to full mode
- Change theme
- Change layout (list → grid → kanban)
- Drag task between kanban columns
- Edit and delete a task
- Close and reopen to verify persistence

- [ ] **Step 5: Fix any issues found**

Address any bugs or styling issues discovered during testing.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final polish and fixes"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Project scaffolding | 12 files |
| 2 | TypeScript types | 1 file |
| 3 | Rust storage | 1 file |
| 4 | Rust commands & tray | 3 files |
| 5 | React entry & themes | 7 files |
| 6 | Window hooks | 2 files |
| 7 | Task hooks | 2 files |
| 8 | Mini mode | 4 files |
| 9 | Add task form | 1 file |
| 10 | Full mode | 3 files |
| 11 | Card & kanban views | 2 files |
| 12 | Wire up App.tsx | 1 file |
| 13 | Test & polish | - |

**Total: ~39 files, 13 tasks**
