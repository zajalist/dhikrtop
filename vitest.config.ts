import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: [],
        exclude: [
            "node_modules/**",
            "dist/**",
            "src/components/__tests__/AdhkarCard.test.tsx",
            "src/windows/__tests__/SettingsWindow.test.tsx",
            "src/windows/__tests__/SetupWindow.test.tsx",
        ],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: ["node_modules/", "dist/", "**/*.d.ts", "**/*.config.*"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
