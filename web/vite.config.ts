import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 本地开发时，前端跑在 5173，后端跑在 3000。
    // 这条代理让前端可以直接请求 /api/...，不用处理跨域。
    // 生产环境里这件事由 Caddy 完成，配置在根目录 Caddyfile。
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
