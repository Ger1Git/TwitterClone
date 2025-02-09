import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import dotenv from 'dotenv';

// Load environment variables from .env files
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

export default defineConfig({
    base: '/',
    plugins: [react()],
    css: {
        postcss: {
            plugins: [tailwindcss()]
        }
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL,
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: 'dist'
    }
});
