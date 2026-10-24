import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  server: {
    port: 5173,
    // 本地开发代理：把前端 /api 请求转发给本地 4000 端口的后端
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  },

  // 打包构建配置（当你运行 npm run build 时生效）
  build: {
    outDir: 'dist', // 打包输出文件夹
    assetsDir: 'assets', // 静态资源文件夹
    sourcemap: false, // 生产环境关闭 sourcemap，防止源码泄露
    // 如果你的云服务器带宽较小，可以开启压缩
    minify: 'esbuild',
  }
})