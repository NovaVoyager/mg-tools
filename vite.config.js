import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        Sitemap({
            hostname: 'https://tools.37pq.cn',
            dynamicRoutes: [
                '/',
                '/#/image-format',
                '/#/json-tools',
                '/#/timestamp',
                '/#/base64',
                '/#/url',
            ],
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString().split('T')[0],
        })
    ],
    build: {
        chunkSizeWarningLimit: 1000, // 可以适当调大，配合分包使用
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // 将 node_modules 中的依赖拆分到 vendor chunk 中
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                }
            }
        }
    },
})
