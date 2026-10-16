import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` emits one self-contained dist/index.html (JS + CSS inlined),
// copied to jadjang.html so it opens straight from disk on any device.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { chunkSizeWarningLimit: 2000 },
})
