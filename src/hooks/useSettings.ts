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
