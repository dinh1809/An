import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeProvider";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    showLabel?: boolean;
}

export function ThemeToggle({
    variant = "ghost",
    size = "default",
    showLabel = true
}: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant={variant}
            size={size}
            onClick={toggleTheme}
            className="gap-2 transition-all duration-300"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
            <div className="relative w-5 h-5">
                <Sun
                    className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${theme === "light"
                            ? "rotate-0 scale-100 opacity-100"
                            : "rotate-90 scale-0 opacity-0"
                        }`}
                />
                <Moon
                    className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${theme === "dark"
                            ? "rotate-0 scale-100 opacity-100"
                            : "-rotate-90 scale-0 opacity-0"
                        }`}
                />
            </div>
            {showLabel && (
                <span className="hidden sm:inline">
                    {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
                </span>
            )}
        </Button>
    );
}
