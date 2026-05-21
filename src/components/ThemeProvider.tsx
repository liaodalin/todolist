// src/components/ThemeProvider.tsx

import React, { createContext, useContext, useEffect, useRef } from "react";
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
  const initialized = useRef(false);

  // Set theme immediately on mount
  if (!initialized.current) {
    document.documentElement.setAttribute("data-theme", theme);
    initialized.current = true;
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
