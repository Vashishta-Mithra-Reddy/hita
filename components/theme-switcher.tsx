"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import useSound from "use-sound";

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [click] = useSound("/click.wav", { volume: 0.20 });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
    click();
  };

  return (
    <>
      <div
          className={`flex items-center gap-2 rounded-r-xl px-12 py-4 text-center border-l-2 border-dashed border-foreground/10 transition-all duration-300 hover:bg-foreground/5 hover:text-foreground/90 relative cursor-pointer`}
          onClick={toggleTheme}
        >
          <Sun className="size-6 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
          <Moon className="absolute size-6 -rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </div>
    </>
  );
}

export default ThemeSwitcher;