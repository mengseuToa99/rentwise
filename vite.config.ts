import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: [
                'resources/views/**', 
                'app/Http/Controllers/**', 
                'resources/lang/**' // Excluding 'routes/api.php' to prevent unnecessary reloads
            ],
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js')
        }
    },
    server: {
        host: true, // Needed for Docker
        hmr: {
            host: '0.0.0.0', // Ensures it works inside Docker
        },
        watch: {
            usePolling: false, // Disable polling unless necessary
        },
        port: 5173,
        strictPort: true,
    },
});
