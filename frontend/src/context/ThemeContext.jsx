"use client";
import { createContext, useContext } from "react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {}
});

export function ThemeProvider({ children }) {
  // Dark mode only — light mode has been removed for brand consistency.
  const theme = "dark";

  // Ensure the root element always carries the dark class.
  if (typeof document !== "undefined") {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);