import { createContext, useContext, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  setTheme: (_theme: "light" | "dark") => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
