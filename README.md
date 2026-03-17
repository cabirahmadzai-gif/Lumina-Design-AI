# Lumina Design AI - Build System Documentation

This project uses a modern, production-ready build system powered by [Vite](https://vitejs.dev/), configured to optimize assets, minify code, and generate a robust `dist` folder.

## 🚀 Features

- **Lightning Fast Compilation**: Powered by esbuild for rapid development and building.
- **Production Optimization**: Automatic minification, tree-shaking, and dead-code elimination.
- **Asset Handling**: Inlines small assets (under 4kb) and hashes filenames for cache-busting.
- **CSS Processing**: Extracts CSS to separate files and processes Tailwind CSS.
- **SEO & PWA Ready**: Automatically generates `manifest.json`, `sitemap.xml`, and `robots.txt` during the build process.
- **Testing**: Configured with Vitest and React Testing Library.

## 📁 Folder Structure

```
├── .env.example          # Example environment variables
├── .env.development      # Development environment variables
├── .env.production       # Production environment variables
├── index.html            # Main HTML template
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite build configuration
├── scripts/
│   └── build.js          # Custom build automation script
├── src/                  # Source code
│   ├── index.tsx         # Application entry point
│   ├── App.tsx           # Main application component
│   └── ...
├── public/               # Static assets (copied to dist as-is)
└── tests/                # Test files and setup
```

## 🛠️ Installation

1. Ensure you have Node.js installed (v18+ recommended).
2. Install dependencies:
   ```bash
   npm install
   ```

## 💻 Available Commands

### Development

Start the development server with hot-module replacement (HMR):
```bash
npm run dev
```

### Production Build

Run the automated build process. This will clean the `dist` folder, compile the code, generate source maps, and create SEO/PWA assets:
```bash
npm run build
```

*Note: You can also run just the Vite build step using `npm run build:vite`.*

### Testing

Run the test suite using Vitest:
```bash
npm run test
```
To run tests in watch mode:
```bash
npm run test:watch
```

### Utility Commands

Clean the `dist` folder manually:
```bash
npm run clean
```

Preview the production build locally:
```bash
npm run preview
```

## ⚙️ Customizing the Build

The build process is controlled by two main files:

1. **`vite.config.ts`**: Modifies how Vite bundles the application.
   - Change `build.minify` to adjust minification settings.
   - Modify `build.rollupOptions.output.manualChunks` to change how vendor code is split.
   - Adjust `build.assetsInlineLimit` to change the threshold for inlining assets as base64.

2. **`scripts/build.js`**: Controls the automation pipeline.
   - Modify the `manifest` object to update PWA settings.
   - Update the `sitemap` XML string to include dynamic routes.
   - Change the `robots.txt` content as needed.

## 🚀 Deployment

The generated `dist` folder contains everything needed for deployment. It can be hosted on any static file server or CDN (e.g., Vercel, Netlify, AWS S3, GitHub Pages).

1. Run `npm run build`.
2. Upload the contents of the `dist` directory to your hosting provider.
3. Ensure your web server is configured to route all requests to `index.html` (SPA routing fallback).
