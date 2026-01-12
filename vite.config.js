import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
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
