import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development/production)
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    // Plugins for React and other features
    plugins: [react()],
    
    // Define global constants
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    
    // Path aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },

    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      
      // Clean the output directory before building
      emptyOutDir: true,
      
      // Generate source maps for debugging
      sourcemap: true,
      
      // Minify code using esbuild (default and fastest)
      minify: 'esbuild',
      
      // CSS code splitting (extracts CSS to separate files)
      cssCodeSplit: true,
      
      // Asset optimization: inline assets smaller than 4kb
      assetsInlineLimit: 4096,
      
      // Rollup specific options
      rollupOptions: {
        // Input file
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        
        // Output configuration
        output: {
          // Creates a version hash for cache busting
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          
          // Manual code splitting: separate vendor code
          manualChunks: {
            vendor: ['react', 'react-dom'],
          }
        }
      }
    },
    
    // CSS processing configuration
    css: {
      // Vite handles PostCSS and Autoprefixer natively when configured
      // Tailwind is processed via the new v4 @import "tailwindcss"
      devSourcemap: true,
    },
    
    // Test configuration (Vitest)
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './tests/setup.ts',
    }
  };
});
