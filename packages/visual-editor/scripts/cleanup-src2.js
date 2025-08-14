#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

async function cleanupSrc2() {
  const src2Path = path.resolve(__dirname, '../../mobile/src2');

  try {
    console.log('🧹 [Cleanup] Cleaning up src2 environment...');

    // Check if src2 exists
    if (await fs.pathExists(src2Path)) {
      await fs.remove(src2Path);
      console.log('✅ [Cleanup] src2 directory removed successfully');
    } else {
      console.log('ℹ️  [Cleanup] src2 directory does not exist, nothing to clean');
    }

    console.log('🎉 [Cleanup] Cleanup completed');

  } catch (error) {
    console.error('❌ [Cleanup] Failed to cleanup src2:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupSrc2();
}

module.exports = { cleanupSrc2 };
