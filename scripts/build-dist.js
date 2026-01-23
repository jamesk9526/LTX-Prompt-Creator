#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.join(__dirname, '..', 'dist');
const outDir = path.join(__dirname, '..', 'out');
const electronDir = path.join(__dirname, '..', 'electron');
const publicDir = path.join(__dirname, '..', 'public');

console.log('🔨 Building Next.js...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (err) {
  console.error('❌ Next.js build failed');
  process.exit(1);
}

console.log('\n📦 Creating dist folder...');
if (fs.existsSync(distDir)) {
  try {
    fs.rmSync(distDir, { recursive: true, force: true });
  } catch (err) {
    console.warn('⚠️  Could not remove old dist, overwriting files...');
  }
}
fs.mkdirSync(distDir, { recursive: true });

console.log('📄 Copying files...');
// Copy Next.js build output
if (fs.existsSync(outDir)) {
  copy(outDir, path.join(distDir, 'out'));
}

// Copy electron files
if (fs.existsSync(electronDir)) {
  copy(electronDir, path.join(distDir, 'electron'));
}

// Copy public assets if they exist
if (fs.existsSync(publicDir)) {
  copy(publicDir, path.join(distDir, 'public'));
}

// Copy package.json and node_modules info
const packageJson = require(path.join(__dirname, '..', 'package.json'));
fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify({
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    main: packageJson.main,
    dependencies: packageJson.dependencies,
  }, null, 2)
);

console.log('🚀 Creating run.bat...');
const batContent = `@echo off
setlocal enabledelayedexpansion

REM Navigate to script directory
cd /d "%~dp0"

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install --production
)

REM Start the Electron app
echo Starting LTX Prompter...
start "" electron .

endlocal
`;

fs.writeFileSync(path.join(distDir, 'run.bat'), batContent);

console.log('✅ Build complete!');
console.log(`📁 Dist folder: ${distDir}`);
console.log(`🎯 To run: cd dist && run.bat`);

function copy(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((file) => {
      copy(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
