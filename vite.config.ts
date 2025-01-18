import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: true, // Needed for Docker
        hmr: {
            host: 'localhost'
        },
        watch: {
            usePolling: true
        },
        port: 5173,
        strictPort: true,
    },
});