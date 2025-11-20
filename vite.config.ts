import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/tmajs-prime-reactjs-template/',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
  plugins: [
    // Позволяет использовать React dev server наряду с созданием приложения React с помощью Vite.
    // https://npmjs.com/package/@vitejs/plugin-react-swc
    react(),
    // Позволяет использовать свойство compiler Options.paths в файле tsconfig.json.
    // https://www.npmjs.com/package/vite-tsconfig-paths
    tsconfigPaths(),
    // Создаёт собственный SSL-сертификат, действительный для локального компьютера.
    // Для использования этого плагина требуются права администратора при первом запуске в режиме разработки.
    // https://www.npmjs.com/package/vite-plugin-mkcert
    process.env.HTTPS && mkcert(),
  ],
  build: {
    target: 'esnext',
    minify: 'terser'
  },
  publicDir: './public',
  server: {
    // Предоставляет доступ к вашему серверу разработки и делает его доступным для устройств в той же сети.
    host: true,
  },
});
