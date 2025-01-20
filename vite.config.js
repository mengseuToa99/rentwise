import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx', // Entry point for React
            refresh: true, // Enable hot module replacement (HMR)
        }),
        react(), // Enable React support
    ],
    server: {
        host: '0.0.0.0', // Allow access from all hosts
        hmr: {
            host: 'localhost', // HMR host
        },
        watch: {
            usePolling: true, // Enable polling for file changes (useful in some environments)
        },
        port: 5173, // Port for the Vite dev server
    },
});