
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const isCareerMode = location.pathname.startsWith("/career") || location.pathname.startsWith("/admin");

    useEffect(() => {
        // Optional: Dynamic class body manipulation if needed
        // but wrapping a div is often cleaner for React
    }, [isCareerMode]);

    return (
        <div className={isCareerMode ? "theme-career" : "theme-connect"}>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
                {children}
            </div>
        </div>
    );
}
