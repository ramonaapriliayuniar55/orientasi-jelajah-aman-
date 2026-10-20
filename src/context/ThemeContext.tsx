// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ModeTema = "light" | "dark" | "system";

export interface SkemaWarna {
  isDark: boolean;
  background: string;
  cardBg: string;
  text: string;
  subText: string;
  border: string;
  primary: string;
}

interface ThemeContextType {
  mode: ModeTema;
  setMode: (mode: ModeTema) => void;
  colors: SkemaWarna;
}

const KEY_THEME = "jelajah_aman_theme_mode";

const temaTerang: SkemaWarna = {
  isDark: false,
  background: "#FFFFFF",
  cardBg: "#F3F4F6",
  text: "#1F2937",
  subText: "#6B7280",
  border: "#E5E7EB",
  primary: "#2563EB",
};

const temaGelap: SkemaWarna = {
  isDark: true,
  background: "#111827",
  cardBg: "#1F2937",
  text: "#F9FAFB",
  subText: "#9CA3AF",
  border: "#374151",
  primary:"#2563EB",
};

const ThemeContext = createContext<ThemeContextType>({
  mode: "system",
  setMode: () => {},
  colors: temaTerang,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ModeTema>("system");
  const systemScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(KEY_THEME).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setModeState(saved as ModeTema);
      }
    });
  }, []);

  const setMode = async (newMode: ModeTema) => {
    setModeState(newMode);
    await AsyncStorage.setItem(KEY_THEME, newMode);
  };

  const isDark =
    mode === "dark" || (mode === "system" && systemScheme === "dark");

  const colors = isDark ? temaGelap : temaTerang;

  return (
    <ThemeContext.Provider value={{ mode, setMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
