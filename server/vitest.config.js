import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        setupFiles: ['./vitest.setup.js'],
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.js'],
            exclude: [
                'src/tests/**',
                'src/config/**',
                'src/logger/**',
                'src/migrations/**',
                'src/prisma/**',
                'src/app.js',
                'src/server.js',
                '**node_modules/**',
            ],
        }
    },
});