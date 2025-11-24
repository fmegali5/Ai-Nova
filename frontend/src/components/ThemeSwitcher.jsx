import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // تحميل الثيم المحفوظ
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      // تحويل لـ Light Mode
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      // تحويل لـ Dark Mode
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-800 dark:bg-slate-700 border border-slate-700 dark:border-slate-600 hover:bg-slate-700 dark:hover:bg-slate-600 transition-all"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun size={20} className="text-yellow-400" />
      ) : (
        <Moon size={20} className="text-slate-400" />
      )}
    </button>
  );
}

export default ThemeSwitcher;
