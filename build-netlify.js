import { mkdir, copyFile } from 'fs/promises';
import { existsSync } from 'fs';

async function build() {
  try {
    if (!existsSync('dist')) {
      await mkdir('dist', { recursive: true });
    }
    await copyFile('hf_benchmark.html', 'dist/index.html');
    console.log('✓ Copied hf_benchmark.html to dist/index.html');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();

