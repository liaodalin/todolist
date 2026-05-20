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
