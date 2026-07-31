import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "theme_mode";

const getSystemDark = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
};

const getInitialMode = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // ignore
  }
  return "system";
};

const initialState = {
  mode: getInitialMode(),
  isDark:
    getInitialMode() === "dark" || (getInitialMode() === "system" && getSystemDark()),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      const mode = action.payload;
      state.mode = mode;
      state.isDark = mode === "dark" || (mode === "system" && getSystemDark());
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // ignore
      }
    },
    setSystemTheme: (state) => {
      state.isDark = getSystemDark();
    },
  },
});

export const { setThemeMode, setSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
