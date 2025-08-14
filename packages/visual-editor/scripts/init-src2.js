#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

async function initSrc2() {
  const src2Path = path.resolve(__dirname, '../../mobile/src2');
  const srcPath = path.resolve(__dirname, '../../mobile/src');

  try {
    console.log('🎨 [Init] Initializing src2 environment...');

    // Check if src2 already exists
    if (await fs.pathExists(src2Path)) {
      console.log('⚠️  [Init] src2 directory already exists, removing...');
      await fs.remove(src2Path);
    }

    // Ensure src directory exists
    if (!(await fs.pathExists(srcPath))) {
      throw new Error(`Source directory not found: ${srcPath}`);
    }

    // Copy src to src2
    console.log('📁 [Init] Copying src to src2...');
    await fs.copy(srcPath, src2Path, {
      filter: (src) => {
        // Skip certain files/directories
        const relativePath = path.relative(srcPath, src);
        const skipPatterns = [
          '__tests__',
          '*.test.ts',
          '*.test.tsx',
          '*.spec.ts',
          '*.spec.tsx',
          '.DS_Store',
          'node_modules',
        ];
        
        return !skipPatterns.some(pattern => {
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(relativePath);
          }
          return relativePath.includes(pattern);
        });
      }
    });

    console.log('✅ [Init] src2 environment initialized successfully');
    console.log(`📍 [Init] src2 location: ${src2Path}`);
    
    // List some key files to verify
    const keyFiles = ['App.tsx', 'components', 'screens'];
    for (const file of keyFiles) {
      const filePath = path.join(src2Path, file);
      if (await fs.pathExists(filePath)) {
        console.log(`✓ [Init] Found: ${file}`);
      } else {
        console.log(`✗ [Init] Missing: ${file}`);
      }
    }

  } catch (error) {
    console.error('❌ [Init] Failed to initialize src2:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initSrc2();
}

module.exports = { initSrc2 };
