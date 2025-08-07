import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This is required for Vite to work correctly with CodeSandbox
const server = process.env.APP_ENV === "sandbox" ? { hmr: { clientPort: 443 } } : {};

// https://vitejs.dev/config/
export default defineConfig({
  server: server,
  resolve: {
    alias: {
      "@src": resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      '@react-three/fiber',
      '@react-three/drei',
      'three',
      'gsap',
      'lenis'
    ],
    exclude: [
      // Exclude heavy 3D components from pre-bundling
      '@src/Showcase/BallPress.jsx',
      '@src/Showcase/Ribbons.jsx',
      '@src/Showcase/InfinityWall.jsx'
    ]
  },
  build: {
    // Bundle splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks only - let Vite handle component splitting automatically
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'animation-vendor': ['gsap'],
          'ui-vendor': ['lenis']
        }
      }
    },
    // Performance optimizations
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
