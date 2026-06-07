"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex size-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <Sun
        className={`size-4 transition-all duration-300 ${
          theme === "dark" ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        suppressHydrationWarning
      />
      <Moon
        className={`absolute size-4 transition-all duration-300 ${
          theme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
        suppressHydrationWarning
      />
    </button>
  );
}
