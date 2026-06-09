"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className="p-2 rounded-md w-fit group hover:scale-105 duration-300 cursor-pointer border"
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
    >
      {theme === "dark" ? (
        <Sun className="h-4 group-hover:rotate-180 duration-1000 w-4" />
      ) : (
        <Moon className="h-4 group-hover:rotate-360 duration-1000 w-4" />
      )}
    </button>
  );
}