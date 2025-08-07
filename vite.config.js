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
    ]
  },
  build: {
    // Bundle splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'animation-vendor': ['gsap'],
          'ui-vendor': ['lenis'],
          
          // Feature chunks
          'showcase-components': [
            './src/Showcase/BallPress.jsx',
            './src/Showcase/Ribbons.jsx',
            './src/Showcase/InfinityWall.jsx',
            './src/Showcase/Smiley.jsx',
            './src/Showcase/Grid.jsx',
            './src/Showcase/Pool.jsx',
            './src/Showcase/ScaredFace.jsx',
            './src/Showcase/HypnoticLoader.jsx',
            './src/Showcase/AnybodyHome.jsx',
            './src/Showcase/CanYouSeeMe.jsx',
            './src/Showcase/RubberStrings.jsx',
            './src/Showcase/Backroom.jsx'
          ],
          'ui-components': [
            './src/Component/Header.jsx',
            './src/Component/Logo.jsx',
            './src/Component/Filter.jsx',
            './src/Component/QuickNav.jsx'
          ]
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
