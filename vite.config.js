import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// En GitHub Pages el sitio vive bajo /totalsleep/; en local usamos la raíz.
const base = process.env.GITHUB_PAGES === 'true' ? '/totalsleep/' : '/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
});
