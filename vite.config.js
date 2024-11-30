import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
//import ziggy from "ziggy-vite-plugin"; // Import Ziggy Vite plugin
import path from "path"; // <-- Add this line to import the path module

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
        //ziggy(), // Add Ziggy plugin here
    ],

    resolve: {
        alias: {
            "ziggy-js": path.resolve(__dirname, "node_modules/ziggy-js"),
        },
    },
});
