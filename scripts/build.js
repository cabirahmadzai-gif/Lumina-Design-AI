import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const distPath = path.resolve(process.cwd(), 'dist');
const publicPath = path.resolve(process.cwd(), 'public');

console.log(chalk.blue('Starting production build process...'));

try {
  // 1. Clean the dist folder
  console.log(chalk.yellow('\n🧹 Cleaning dist folder...'));
  execSync('npm run clean', { stdio: 'inherit' });

  // 2. Run the Vite build
  console.log(chalk.yellow('\n📦 Building application with Vite...'));
  execSync('npm run build:vite', { stdio: 'inherit' });

  // 3. Generate manifest.json (if not already in public)
  console.log(chalk.yellow('\n📝 Generating manifest.json...'));
  const manifest = {
    name: "Lumina Design AI",
    short_name: "Lumina",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
  fs.writeFileSync(
    path.join(distPath, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // 4. Generate sitemap.xml
  console.log(chalk.yellow('\n🗺️ Generating sitemap.xml...'));
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap);

  // 5. Generate robots.txt
  console.log(chalk.yellow('\n🤖 Generating robots.txt...'));
  const robots = `User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml`;
  fs.writeFileSync(path.join(distPath, 'robots.txt'), robots);

  // 6. Report build statistics
  console.log(chalk.green('\n✅ Build completed successfully!'));
  
  const getDirSize = (dirPath) => {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stat.size;
      }
    }
    return size;
  };

  const totalSize = getDirSize(distPath);
  console.log(chalk.cyan(`\n📊 Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`));

} catch (error) {
  console.error(chalk.red('\n❌ Build failed!'));
  console.error(error.message);
  process.exit(1);
}
